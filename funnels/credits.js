// funnels/credits.js — OnlyCoins client module (free + paid credits)
//
// Mecânica:
//   - Free: bucket diário em localStorage (device-bound), reseta por dia UTC.
//   - Paid: persistente no Supabase (identity-bound via WhatsApp OTP). Cache local.
//   - Ordem de gasto: free primeiro, paid depois.
//
// API pública (window.OnlyCoins):
//   getBalance()           -> { free, paid, total }
//   canAfford(amount)      -> boolean
//   spend(amount)          -> { ok, fromFree, fromPaid, remaining }
//   refreshFromServer()    -> Promise<{ paid } | null>
//   hasSession()           -> boolean
//   getToken()             -> string | null
//   setSession({token, paid_balance, user_id, whatsapp}) -> void
//   clearSession()         -> void
//   onChange(cb)           -> unsubscribe()
//
// Eventos disparados via ChatAnalytics.track (se disponível):
//   - credits_free_reset      { newBalance, previousBalance }
//   - credits_spent           { amount, fromFree, fromPaid, remaining }
//   - credits_session_started { userId, paidBalance }
//   - credits_session_cleared { reason }

(function () {
    'use strict';

    // ---------- Config ----------
    const FREE_DAILY = 25;                  // 5 msgs/dia @ MSG_COST=5
    const MSG_COST = 5;                     // créditos por mensagem do usuário
    const LS_FREE = 'omcoins:free:v2';      // bumped from 'omcoins:free' to migrate users to new daily bucket
    const LS_TOKEN = 'omcoins:token';       // JWT
    const LS_SESSION = 'omcoins:session';   // { userId, whatsapp, paidBalance, updatedAt }

    const API_BASE = (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'))
        ? 'http://localhost:3000/api'
        : '/api';

    // ---------- State ----------
    const listeners = new Set();

    // ---------- Utilities ----------
    function todayUTC() {
        return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    }

    function track(event, props) {
        if (window.ChatAnalytics && typeof window.ChatAnalytics.track === 'function') {
            window.ChatAnalytics.track(event, props || {});
        }
    }

    function readJSON(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function writeJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('[OnlyCoins] localStorage write failed:', key, e);
        }
    }

    function emit() {
        const snap = getBalance();
        for (const cb of listeners) {
            try { cb(snap); } catch (e) { console.error('[OnlyCoins] listener error:', e); }
        }
    }

    // ---------- Free bucket (localStorage, device-bound, daily reset) ----------
    function loadFree() {
        const today = todayUTC();
        const stored = readJSON(LS_FREE);
        if (!stored || stored.dateUTC !== today) {
            const previous = stored ? stored.balance : null;
            const fresh = { balance: FREE_DAILY, dateUTC: today };
            writeJSON(LS_FREE, fresh);
            if (stored) {
                track('credits_free_reset', { newBalance: FREE_DAILY, previousBalance: previous });
            }
            return fresh;
        }
        return stored;
    }

    function saveFree(balance) {
        writeJSON(LS_FREE, { balance, dateUTC: todayUTC() });
    }

    // ---------- Paid bucket (server-side, cached locally) ----------
    function loadSession() {
        return readJSON(LS_SESSION);
    }

    function saveSession(sess) {
        writeJSON(LS_SESSION, sess);
    }

    function getPaidBalance() {
        const sess = loadSession();
        return sess && typeof sess.paidBalance === 'number' ? sess.paidBalance : 0;
    }

    function setPaidBalance(value) {
        const sess = loadSession() || {};
        sess.paidBalance = Math.max(0, Number(value) || 0);
        sess.updatedAt = Date.now();
        saveSession(sess);
    }

    // ---------- Public API ----------
    function getBalance() {
        const free = loadFree().balance;
        const paid = getPaidBalance();
        return { free, paid, total: free + paid };
    }

    function canAfford(amount) {
        return getBalance().total >= Math.max(1, amount | 0);
    }

    function spend(amount) {
        const cost = Math.max(1, amount | 0);
        const freeRow = loadFree();
        const paid = getPaidBalance();

        if (freeRow.balance + paid < cost) {
            return { ok: false, fromFree: 0, fromPaid: 0, remaining: getBalance() };
        }

        const fromFree = Math.min(freeRow.balance, cost);
        const fromPaid = cost - fromFree;

        saveFree(freeRow.balance - fromFree);
        if (fromPaid > 0) setPaidBalance(paid - fromPaid);

        const remaining = getBalance();
        track('credits_spent', { amount: cost, fromFree, fromPaid, remaining });
        emit();

        return { ok: true, fromFree, fromPaid, remaining };
    }

    // ---------- Session (JWT) ----------
    function getToken() {
        try { return localStorage.getItem(LS_TOKEN); } catch (e) { return null; }
    }

    function hasSession() {
        return !!getToken();
    }

    function setSession({ token, paid_balance, user_id, whatsapp }) {
        try { localStorage.setItem(LS_TOKEN, token); } catch (e) { /* ignore */ }
        saveSession({
            userId: user_id,
            whatsapp,
            paidBalance: Number(paid_balance) || 0,
            updatedAt: Date.now()
        });
        track('credits_session_started', { userId: user_id, paidBalance: paid_balance });
        emit();
    }

    function clearSession(reason) {
        try { localStorage.removeItem(LS_TOKEN); } catch (e) { /* ignore */ }
        try { localStorage.removeItem(LS_SESSION); } catch (e) { /* ignore */ }
        track('credits_session_cleared', { reason: reason || 'manual' });
        emit();
    }

    async function refreshFromServer() {
        const token = getToken();
        if (!token) return null;
        try {
            const res = await fetch(`${API_BASE}/credits-balance`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (res.status === 401) {
                clearSession('token_expired');
                return null;
            }
            if (!res.ok) return null;
            const data = await res.json();
            const paid = Number(data.paid_balance) || 0;
            setPaidBalance(paid);
            emit();
            return { paid };
        } catch (e) {
            console.warn('[OnlyCoins] refresh failed:', e);
            return null;
        }
    }

    // ---------- OTP flow ----------
    async function requestOtp(phone) {
        try {
            const res = await fetch(`${API_BASE}/otp-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                return {
                    ok: false,
                    status: res.status,
                    error: data.error || 'Falha ao enviar código',
                    retry_after_seconds: data.retry_after_seconds
                };
            }
            return { ok: true, data };
        } catch (e) {
            return { ok: false, error: 'Erro de conexão. Tenta de novo.' };
        }
    }

    async function buyPack(packKey) {
        const token = getToken();
        if (!token) return { ok: false, error: 'Sessão não iniciada', needAuth: true };
        try {
            const res = await fetch(`${API_BASE}/credit-pack`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ pack_key: packKey })
            });
            const data = await res.json().catch(() => ({}));
            if (res.status === 401) {
                clearSession('token_expired');
                return { ok: false, status: 401, needAuth: true, error: 'Sua sessão expirou. Confirme o WhatsApp de novo.' };
            }
            if (!res.ok) {
                return { ok: false, status: res.status, error: data.error || 'Falha ao gerar PIX' };
            }
            return { ok: true, data };
        } catch (e) {
            return { ok: false, error: 'Erro de conexão. Tenta de novo.' };
        }
    }

    async function verifyOtp(phone, code) {
        try {
            const res = await fetch(`${API_BASE}/otp-verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, code })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                return {
                    ok: false,
                    status: res.status,
                    error: data.error || 'Código incorreto',
                    attempts_remaining: data.attempts_remaining
                };
            }
            setSession({
                token: data.token,
                paid_balance: data.paid_balance,
                user_id: data.user_id,
                whatsapp: data.whatsapp
            });
            return { ok: true, data };
        } catch (e) {
            return { ok: false, error: 'Erro de conexão. Tenta de novo.' };
        }
    }

    // ---------- Listeners ----------
    function onChange(cb) {
        listeners.add(cb);
        return () => listeners.delete(cb);
    }

    // Force lazy init on load so the daily reset fires once per page open.
    loadFree();

    window.OnlyCoins = {
        getBalance,
        canAfford,
        spend,
        refreshFromServer,
        hasSession,
        getToken,
        setSession,
        clearSession,
        onChange,
        requestOtp,
        verifyOtp,
        buyPack,
        FREE_DAILY,
        MSG_COST
    };
})();

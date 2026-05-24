// funnels/engine.js — Chat funnel state machine + intent classifier (regex-based MVP)
//
// Public API: ChatEngine.start(modelId)
//
// Loads per-model funnel JSON (or falls back to _schema.example.json), maintains
// session state in localStorage, drives the chat UI in chat.html.

(function () {
    'use strict';

    // ---------- Config ----------
    const FALLBACK_FUNNEL = 'funnels/_schema.example.json';
    const SESSION_KEY_PREFIX = 'omchat:session:';
    const API_BASE = (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'))
        ? 'http://localhost:3000/api'
        : '/api';

    // ---------- State (kept in this closure) ----------
    let funnel = null;
    let session = null;
    let creator = null;
    let modelId = null;
    let currentOfferContext = null; // tracks which wait_user node is awaiting payment

    // ---------- Analytics helper ----------
    function fire(eventName, props) {
        if (!window.ChatAnalytics || typeof window.ChatAnalytics.track !== 'function') return;
        const base = {
            modelId,
            modelName: creator ? creator.name : null
        };
        window.ChatAnalytics.track(eventName, Object.assign(base, props || {}));
    }

    // ---------- Utilities ----------
    function $(id) { return document.getElementById(id); }

    function sanitize(s) {
        if (s == null) return '';
        const d = document.createElement('div');
        d.textContent = String(s);
        return d.innerHTML;
    }

    function slugify(s) {
        return String(s).toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    }

    function interpolate(text, variables) {
        return String(text).replace(/\{\{(\w+)\}\}/g, (_, key) => {
            return variables && variables[key] ? variables[key] : 'amor';
        });
    }

    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    function scrollToBottom() {
        const el = $('chatMessages');
        if (el) el.scrollTop = el.scrollHeight;
    }

    // ---------- Session ----------
    function sessionKey() { return SESSION_KEY_PREFIX + modelId; }

    function loadSession() {
        try {
            const raw = localStorage.getItem(sessionKey());
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (parsed.funnelVersion !== funnel.funnelVersion) return null; // version mismatch -> reset
            return parsed;
        } catch (e) {
            return null;
        }
    }

    function newSession() {
        return {
            modelId,
            funnelVersion: funnel.funnelVersion,
            currentNodeId: funnel.entryNode,
            variables: {},
            history: [],
            purchasedSkus: [],
            startedAt: Date.now(),
            lastActivityAt: Date.now()
        };
    }

    function saveSession() {
        if (!session) return;
        session.lastActivityAt = Date.now();
        try {
            localStorage.setItem(sessionKey(), JSON.stringify(session));
        } catch (e) {
            console.warn('[ChatEngine] localStorage save failed:', e);
        }
    }

    // ---------- DOM rendering ----------
    function renderBubble(entry) {
        const container = $('chatMessages');
        if (!container) return;

        const div = document.createElement('div');

        if (entry.type === 'offer') {
            div.className = 'offer-card';
            const o = entry.offer;
            const thumb = o.thumbnailUrl || (creator && (creator.avatar || creator.photos[0])) || '';
            div.innerHTML = `
                <div class="offer-card-preview">
                    <img src="${sanitize(thumb)}" alt="">
                    <div class="offer-card-lock">
                        <div class="lock-icon">🔒</div>
                        <div class="lock-label">Conteúdo bloqueado</div>
                    </div>
                </div>
                <div class="offer-card-body">
                    <div class="offer-card-text">${sanitize(entry.text || o.label)}</div>
                    ${o.description ? `<div class="offer-card-desc">${sanitize(o.description)}</div>` : ''}
                    <div class="offer-card-row">
                        <div class="offer-card-price">R$ ${o.price.toFixed(2).replace('.', ',')}</div>
                        <button class="offer-card-cta" data-sku="${sanitize(o.sku)}">
                            ${session.purchasedSkus.includes(o.sku) ? '✓ DESBLOQUEADO' : 'LIBERAR PIX'}
                        </button>
                    </div>
                </div>
            `;
            const btn = div.querySelector('.offer-card-cta');
            if (session.purchasedSkus.includes(o.sku)) {
                btn.disabled = true;
            } else {
                btn.addEventListener('click', () => openCheckout(o));
            }
        } else if (entry.type === 'media') {
            div.className = 'bubble media model';
            div.innerHTML = `
                <img src="${sanitize(entry.mediaUrl)}" alt="">
                ${entry.text ? `<div class="media-caption">${sanitize(entry.text)}</div>` : ''}
            `;
        } else {
            // text
            div.className = entry.from === 'user' ? 'bubble user' : 'bubble model';
            div.textContent = entry.text;
        }

        container.appendChild(div);
        scrollToBottom();
    }

    function showTyping() {
        const container = $('chatMessages');
        if (!container) return;
        let el = $('chatTyping');
        if (el) return; // already showing
        el = document.createElement('div');
        el.id = 'chatTyping';
        el.className = 'bubble typing';
        el.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        container.appendChild(el);
        scrollToBottom();
    }

    function hideTyping() {
        const el = $('chatTyping');
        if (el) el.remove();
    }

    function restoreHistory() {
        const container = $('chatMessages');
        if (container) container.innerHTML = '';
        for (const entry of session.history) {
            renderBubble(entry);
        }
        if (session.history.length === 0) {
            showEmptyHint();
        }
    }

    function showEmptyHint() {
        const container = $('chatMessages');
        if (!container) return;
        if (container.querySelector('.chat-empty-hint')) return;
        const firstName = (creator && creator.name) ? creator.name.split(' ')[0] : 'Ela';
        const hint = document.createElement('div');
        hint.className = 'chat-empty-hint';
        hint.style.cssText = 'text-align:center; color:#666; font-size:0.82rem; padding:40px 20px 20px; line-height:1.6;';
        hint.innerHTML = `<strong style="color:#aaa;">${sanitize(firstName)}</strong> está online.<br><span style="color:#777;">Manda uma mensagem pra começar 👋</span>`;
        container.appendChild(hint);
    }

    function hideEmptyHint() {
        const el = document.querySelector('.chat-empty-hint');
        if (el) el.remove();
    }

    function appendHistory(entry) {
        hideEmptyHint();
        session.history.push({ ...entry, ts: Date.now() });
        renderBubble(entry);
        saveSession();
    }

    // ---------- Input control ----------
    function enableInput() {
        const inp = $('chatInput');
        const btn = $('chatSend');
        if (!inp || !btn) return;

        const currentNode = funnel && funnel.nodes[session.currentNodeId];
        inp.placeholder = (currentNode && currentNode.inputPlaceholder) || 'Mensagem...';

        inp.disabled = false;
        btn.disabled = false;
        inp.focus();
    }

    function disableInput() {
        const inp = $('chatInput');
        const btn = $('chatSend');
        if (!inp || !btn) return;
        inp.disabled = true;
        btn.disabled = true;
    }

    // ---------- Intent classifier (regex-based) ----------
    const INTENT_PATTERNS = {
        rude:           /\b(vai\s*(se)?\s*f(o|u)der|caralh|porra|merda|piranha|puta|filha\s*da|cuzao|cuz[ãa]o|otario|ot[áa]rio|vsf)\b/i,
        despedida:      /\b(tchau|flw|vlw|valeu|at[eé]\s+(mais|logo|depois)|sair|bye|adeus|falo)\b/i,
        pronto_pagar:   /\b(quero|manda|to\s*dentro|t[oô]\s*dentro|vamo|fechado|aceito|comprar|gostei|libera|pode\s*mandar|t[oô]\s*pagando|paguei)\b/i,
        pechinchando:   /\b(barato|caro|desconto|menos|metade|reduz|abaixa|sem\s*grana|ta\s*caro|t[áa]\s*caro|n[ãa]o\s*tenho\s*tanto|tem\s*menor)\b/i,
        perguntou_preco:/\b(quanto|pre[çc]o|valor|custa|cobra|qnto)\b/i,
        cetico:         /\b(s[eé]rio|verdade|mentira|f[eé]|prova|golpe|fake|bot|seguro|cilada|conf[ií]o|ser[áa])\b/i,
        tarado:         /\b(gostosa|del[ií]cia|tes[ãa]o|safada|bucet|piroc|chup|fud|gozo|gozar|peit[oão]|bund[ãa]o|nud)\b/i,
        vai_pensar:     /\b(depois|amanh[ãa]|pensar|talvez|n[ãa]o\s*sei|ainda\s*n[ãa]o|d[áa]\s*um\s*tempo)\b/i,
        frio:           /\b(n[ãa]o\s*quero|sem\s*interesse|deixa\s*pra\s*l[áa]|n[ãa]o\s*vou|nao\s*to\s*afim|nao\s*to\s*a\s*fim)\b/i,
        interessado:    /\b(sim|claro|com\s*certeza|legal|bacana|massa|adorei|curti|opa|opaa|hmmm|interessante|mostra)\b/i
    };

    // Priority order: catch destructive/exit intents first, then commercial, then default
    const INTENT_PRIORITY = [
        'rude',
        'despedida',
        'pronto_pagar',
        'pechinchando',
        'perguntou_preco',
        'cetico',
        'tarado',
        'vai_pensar',
        'frio',
        'interessado'
    ];

    function classifyIntent(text, allowedIntents) {
        const t = String(text).toLowerCase().trim();
        if (!t) return 'default';

        // Special: if node accepts informed_name and text is a single word 2-20 chars, capture
        if (allowedIntents.includes('informed_name') && /^[a-zà-úA-ZÀ-Ú]{2,20}$/.test(t)) {
            return 'informed_name';
        }

        for (const intent of INTENT_PRIORITY) {
            if (allowedIntents.includes(intent) && INTENT_PATTERNS[intent] && INTENT_PATTERNS[intent].test(t)) {
                return intent;
            }
        }
        return 'default';
    }

    // ---------- State machine ----------
    let running = false; // prevents reentrant processing

    async function processNode(nodeId) {
        if (!nodeId) return;
        if (running) return;
        running = true;

        try {
            session.currentNodeId = nodeId;
            saveSession();

            const node = funnel.nodes[nodeId];
            if (!node) {
                console.warn('[ChatEngine] Node not found:', nodeId);
                return;
            }

            fire('funnel_node_reached', { nodeId, nodeType: node.type });

            if (node.type === 'model_message') {
                showTyping();
                await sleep(node.delayMs || 1500);
                hideTyping();
                const text = interpolate(node.text, session.variables);
                appendHistory({ from: 'model', type: 'text', text });
                running = false;
                if (node.next) {
                    await processNode(node.next);
                }
                return;
            }

            if (node.type === 'model_media') {
                showTyping();
                await sleep(node.delayMs || 2500);
                hideTyping();
                const text = node.text ? interpolate(node.text, session.variables) : '';
                appendHistory({ from: 'model', type: 'media', mediaUrl: node.mediaUrl, text });
                running = false;
                if (node.next) {
                    await processNode(node.next);
                }
                return;
            }

            if (node.type === 'model_offer') {
                showTyping();
                await sleep(node.delayMs || 2000);
                hideTyping();
                const text = node.text ? interpolate(node.text, session.variables) : '';
                appendHistory({ from: 'model', type: 'offer', text, offer: node.offer });
                fire('offer_shown', { sku: node.offer.sku, price: node.offer.price, label: node.offer.label, nodeId });
                running = false;
                if (node.next) {
                    await processNode(node.next);
                }
                return;
            }

            if (node.type === 'wait_user') {
                enableInput();
                running = false;
                return;
            }

            console.warn('[ChatEngine] Unknown node type:', node.type);
        } finally {
            // running flag is handled per-branch above
        }
    }

    function openOutOfCreditsPaywall() {
        fire('out_of_credits', window.OnlyCoins ? OnlyCoins.getBalance() : {});
        if (window.CoinsPaywall && typeof window.CoinsPaywall.open === 'function') {
            window.CoinsPaywall.open('out_of_credits');
        } else {
            alert('Suas OnlyCoins acabaram. Recarregue pra continuar.');
        }
    }

    async function handleUserSubmit(text) {
        const trimmed = (text || '').trim();
        if (!trimmed) return;

        // Custo por mensagem definido em OnlyCoins.MSG_COST. Free primeiro, paid depois.
        if (window.OnlyCoins) {
            const cost = OnlyCoins.MSG_COST || 1;
            if (!OnlyCoins.canAfford(cost)) {
                openOutOfCreditsPaywall();
                return;
            }
            const spent = OnlyCoins.spend(cost);
            if (!spent.ok) {
                openOutOfCreditsPaywall();
                return;
            }
        }

        disableInput();
        $('chatInput').value = '';

        const userMessagesBefore = session.history.filter(h => h.from === 'user').length;
        appendHistory({ from: 'user', type: 'text', text: trimmed });

        if (userMessagesBefore === 0) {
            fire('chat_first_message_sent', { textLen: trimmed.length });
        }

        const currentNode = funnel.nodes[session.currentNodeId];
        if (!currentNode || currentNode.type !== 'wait_user') {
            // shouldn't happen — input was enabled only on wait_user
            return;
        }

        // Capture variable if requested
        if (currentNode.captureAs) {
            session.variables[currentNode.captureAs] = trimmed.slice(0, 40);
            saveSession();
        }

        const allowed = Object.keys(currentNode.transitions || {});
        const intent = classifyIntent(trimmed, allowed);
        fire('intent_classified', { nodeId: session.currentNodeId, intent, textLen: trimmed.length });
        const nextNodeId = currentNode.transitions[intent] || currentNode.transitions['default'];

        if (!nextNodeId) {
            console.warn('[ChatEngine] No transition for intent:', intent, 'on node', session.currentNodeId);
            enableInput();
            return;
        }

        await processNode(nextNodeId);
    }

    // ---------- Checkout (offer card -> PIX modal) ----------
    function openCheckout(offer) {
        currentOfferContext = {
            sku: offer.sku,
            price: offer.price,
            label: offer.label,
            description: offer.description,
            // capture the node that owns this offer at time of click
            ownerNodeId: session.currentNodeId
        };

        fire('offer_clicked', { sku: offer.sku, price: offer.price, label: offer.label });

        $('chatModalTitle').textContent = 'Desbloquear conteúdo';
        $('chatModalAvatar').src = creator.avatar || creator.photos[0] || '';
        $('chatModalLabel').textContent = offer.label;
        $('chatModalCreator').textContent = creator.name;
        $('chatModalPrice').textContent = 'R$ ' + offer.price.toFixed(2).replace('.', ',');

        // Reset modal UI
        $('chatModalPixArea').classList.remove('active');
        const payBtn = $('chatModalPayBtn');
        payBtn.style.display = 'block';
        payBtn.disabled = false;
        payBtn.innerHTML = 'GERAR PIX AGORA';

        $('chatCheckoutModal').classList.add('active');
    }

    async function processPix() {
        if (!currentOfferContext) return;
        const btn = $('chatModalPayBtn');
        btn.disabled = true;
        btn.innerHTML = '<span style="display:inline-block;animation:spin 1s linear infinite;">↻</span> Gerando PIX...';

        try {
            const description = `OnlyModels ${currentOfferContext.label} - ${creator.name}`;
            const res = await fetch(`${API_BASE}/create-pix`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionAmount: currentOfferContext.price,
                    description
                })
            });
            const data = await res.json();

            if (data.error) {
                alert('Erro ao gerar PIX: ' + data.error);
                btn.disabled = false;
                btn.innerHTML = 'GERAR PIX AGORA';
                return;
            }

            $('chatModalPixImg').src = data.qr_code_image_url || '';
            $('chatModalPixCode').value = data.qr_code || '';
            $('chatModalPixArea').classList.add('active');

            fire('pix_generated', {
                sku: currentOfferContext.sku,
                price: currentOfferContext.price,
                label: currentOfferContext.label,
                paymentId: data.payment_id || null
            });

            // Swap pay button for "back to chat"
            btn.innerHTML = '✓ VOLTAR AO CHAT';
            btn.disabled = false;
            btn.onclick = onPixGeneratedReturn;
        } catch (err) {
            console.error('[ChatEngine] PIX error:', err);
            alert('Erro ao conectar com o servidor.');
            btn.disabled = false;
            btn.innerHTML = 'GERAR PIX AGORA';
        }
    }

    function copyPix() {
        const inp = $('chatModalPixCode');
        if (!inp) return;
        inp.select();
        inp.setSelectionRange(0, 99999);
        try {
            navigator.clipboard.writeText(inp.value);
            alert('Código PIX copiado!');
        } catch (e) {
            document.execCommand('copy');
        }
    }

    function onPixGeneratedReturn() {
        // Mark purchased optimistically (matches rest of site convention)
        if (currentOfferContext && !session.purchasedSkus.includes(currentOfferContext.sku)) {
            session.purchasedSkus.push(currentOfferContext.sku);
            saveSession();
        }

        const ownerNodeId = currentOfferContext ? currentOfferContext.ownerNodeId : null;
        closeCheckout();

        // Re-render history so the offer card shows "DESBLOQUEADO"
        restoreHistory();

        // Fire payment_generated transition
        if (ownerNodeId) {
            const ownerNode = funnel.nodes[ownerNodeId];
            if (ownerNode && ownerNode.type === 'wait_user' && ownerNode.onPaymentGenerated) {
                disableInput();
                processNode(ownerNode.onPaymentGenerated);
            }
        }

        currentOfferContext = null;
    }

    function closeCheckout() {
        $('chatCheckoutModal').classList.remove('active');
        // restore pay button default handler
        const btn = $('chatModalPayBtn');
        btn.onclick = processPix;
    }

    // ---------- Funnel loading ----------
    async function loadFunnel() {
        const slug = slugify(creator.name);
        const candidates = [`funnels/${slug}.json`, FALLBACK_FUNNEL];

        for (const path of candidates) {
            try {
                const res = await fetch(path + '?v=' + Date.now(), { cache: 'no-store' });
                if (res.ok) {
                    const json = await res.json();
                    console.log('[ChatEngine] Loaded funnel:', path);
                    return json;
                }
            } catch (e) {
                // try next
            }
        }
        throw new Error('No funnel JSON could be loaded');
    }

    // ---------- Boot ----------
    async function start(id) {
        modelId = id;
        creator = (typeof creatorsData !== 'undefined') ? creatorsData[id] : (window.creatorsData && window.creatorsData[id]);

        if (!creator) {
            console.error('[ChatEngine] Unknown modelId:', id);
            return;
        }

        // Render header
        const avatarEl = $('chatAvatar');
        if (avatarEl) {
            avatarEl.style.backgroundImage = `url("${creator.avatar || creator.photos[0]}")`;
        }
        const nameEl = $('chatName');
        if (nameEl) {
            nameEl.firstElementChild.textContent = creator.name.split(' ')[0];
        }
        if (creator.verified) {
            $('chatVerified').style.display = 'inline';
        }

        // Load funnel
        try {
            funnel = await loadFunnel();
        } catch (e) {
            console.error('[ChatEngine] Funnel load failed:', e);
            $('chatMessages').innerHTML = '<div style="color:#f55;text-align:center;padding:20px;">Erro ao carregar conversa.</div>';
            return;
        }

        // Init or resume session
        const resumedFlag = !!loadSession();
        session = loadSession() || newSession();

        fire('chat_opened', {
            resumed: resumedFlag,
            entryNode: session.currentNodeId,
            historyLen: session.history.length,
            purchasedCount: session.purchasedSkus.length
        });

        // Render existing history
        restoreHistory();
        scrollToBottom();

        // If session is fresh (no history), start from entry
        // If resuming, resume from currentNodeId
        const currentNode = funnel.nodes[session.currentNodeId];
        if (!currentNode) {
            // node was removed in newer funnel version — restart
            session = newSession();
            restoreHistory();
            await processNode(session.currentNodeId);
            return;
        }

        if (currentNode.type === 'wait_user') {
            enableInput();
        } else {
            await processNode(session.currentNodeId);
        }

        // Wire input
        const input = $('chatInput');
        const sendBtn = $('chatSend');
        sendBtn.addEventListener('click', () => handleUserSubmit(input.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleUserSubmit(input.value);
            }
        });

        // Session-end tracking (fires once on unload/hide)
        let endedFired = false;
        const fireSessionEnded = () => {
            if (endedFired) return;
            endedFired = true;
            fire('chat_session_ended', {
                lastNodeId: session.currentNodeId,
                messagesCount: session.history.length,
                userMessagesCount: session.history.filter(h => h.from === 'user').length,
                durationMs: Date.now() - session.startedAt,
                purchasedCount: session.purchasedSkus.length
            });
        };
        window.addEventListener('pagehide', fireSessionEnded);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') fireSessionEnded();
        });
    }

    // Expose
    window.ChatEngine = { start };
    window.chatProcessPix = processPix;
    window.chatCopyPix = copyPix;
    window.closeChatCheckout = closeCheckout;

    // spinning keyframe (avoid touching styles.css)
    const style = document.createElement('style');
    style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
})();

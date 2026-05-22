// api/otp-verify.js — valida código, upsert do usuário, devolve JWT.

import { applyCors } from './_lib/cors.js';
import { supabaseAdmin } from './_lib/supabase.js';
import { normalizeBRPhone } from './_lib/phone.js';
import { compareOtp, OTP_MAX_ATTEMPTS } from './_lib/otp.js';
import { signSessionToken } from './_lib/jwt.js';

export default async function handler(req, res) {
    const originAllowed = applyCors(req, res);
    if (req.method === 'OPTIONS') return res.status(originAllowed ? 204 : 403).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!originAllowed) return res.status(403).json({ error: 'Origin not allowed' });

    try {
        const { phone, code } = req.body || {};
        const whatsapp = normalizeBRPhone(phone);
        if (!whatsapp || !/^\d{6}$/.test(String(code || ''))) {
            return res.status(400).json({ error: 'Número ou código inválido' });
        }

        const nowIso = new Date().toISOString();

        const { data: otpRow, error: selErr } = await supabaseAdmin
            .from('otp_codes')
            .select('id, code_hash, attempts')
            .eq('whatsapp', whatsapp)
            .is('used_at', null)
            .gt('expires_at', nowIso)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (selErr) throw selErr;
        if (!otpRow) {
            return res.status(400).json({ error: 'Código expirado ou inexistente. Solicite um novo.' });
        }
        if (otpRow.attempts >= OTP_MAX_ATTEMPTS) {
            return res.status(429).json({ error: 'Muitas tentativas. Solicite um novo código.' });
        }

        const match = await compareOtp(code, otpRow.code_hash);

        // Incrementa attempts; marca used_at se match (one-shot).
        const newAttempts = otpRow.attempts + 1;
        await supabaseAdmin
            .from('otp_codes')
            .update({
                attempts: newAttempts,
                used_at: match ? nowIso : null,
            })
            .eq('id', otpRow.id);

        if (!match) {
            const remaining = Math.max(0, OTP_MAX_ATTEMPTS - newAttempts);
            return res.status(400).json({
                error: 'Código incorreto',
                attempts_remaining: remaining,
            });
        }

        // Upsert do usuário — preserva paid_credits_balance no conflict.
        const { data: user, error: upsertErr } = await supabaseAdmin
            .from('users')
            .upsert(
                { whatsapp, last_login_at: nowIso },
                { onConflict: 'whatsapp' }
            )
            .select('id, whatsapp, paid_credits_balance')
            .single();
        if (upsertErr) throw upsertErr;

        const token = await signSessionToken({
            userId: user.id,
            whatsapp: user.whatsapp,
        });

        return res.status(200).json({
            token,
            user_id: user.id,
            whatsapp: user.whatsapp,
            paid_balance: user.paid_credits_balance,
        });
    } catch (err) {
        console.error('[otp-verify]', err);
        return res.status(500).json({ error: 'Falha ao verificar código' });
    }
}

// api/otp-request.js — gera código de 6 dígitos, hasheia, manda via Baileys.

import { applyCors } from './_lib/cors.js';
import { supabaseAdmin } from './_lib/supabase.js';
import { normalizeBRPhone } from './_lib/phone.js';
import { generateOtpCode, hashOtp, otpExpiresAt, OTP_TTL_SECONDS } from './_lib/otp.js';

const RATE_LIMIT_PER_MINUTE = 1;
const RATE_LIMIT_PER_HOUR = 5;

async function sendOtpViaWhatsApp(phone, code) {
    const url = process.env.WA_OTP_SERVICE_URL;
    const secret = process.env.WA_OTP_SERVICE_SECRET;
    if (!url || !secret) {
        throw new Error('WA_OTP_SERVICE_URL ou WA_OTP_SERVICE_SECRET não configurados');
    }
    const res = await fetch(`${url.replace(/\/$/, '')}/send-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Secret': secret,
        },
        body: JSON.stringify({ phone, code }),
        signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`wa-otp service [${res.status}]: ${txt.slice(0, 200)}`);
    }
}

async function checkRateLimit(whatsapp) {
    const oneMinAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count: minuteCount, error: e1 } = await supabaseAdmin
        .from('otp_codes')
        .select('id', { count: 'exact', head: true })
        .eq('whatsapp', whatsapp)
        .gte('created_at', oneMinAgo);
    if (e1) throw e1;
    if ((minuteCount || 0) >= RATE_LIMIT_PER_MINUTE) {
        return { ok: false, reason: 'Aguarde 1 minuto entre tentativas.' };
    }

    const { count: hourCount, error: e2 } = await supabaseAdmin
        .from('otp_codes')
        .select('id', { count: 'exact', head: true })
        .eq('whatsapp', whatsapp)
        .gte('created_at', oneHourAgo);
    if (e2) throw e2;
    if ((hourCount || 0) >= RATE_LIMIT_PER_HOUR) {
        return { ok: false, reason: 'Limite de tentativas atingido. Tente novamente em 1 hora.' };
    }

    return { ok: true };
}

export default async function handler(req, res) {
    const originAllowed = applyCors(req, res);
    if (req.method === 'OPTIONS') return res.status(originAllowed ? 204 : 403).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!originAllowed) return res.status(403).json({ error: 'Origin not allowed' });

    try {
        const { phone } = req.body || {};
        const whatsapp = normalizeBRPhone(phone);
        if (!whatsapp) {
            return res.status(400).json({ error: 'Número de WhatsApp inválido' });
        }

        const rl = await checkRateLimit(whatsapp);
        if (!rl.ok) return res.status(429).json({ error: rl.reason });

        // Invalida códigos anteriores não usados (evita reuso de OTP velho)
        await supabaseAdmin
            .from('otp_codes')
            .update({ used_at: new Date().toISOString() })
            .eq('whatsapp', whatsapp)
            .is('used_at', null);

        const code = generateOtpCode();
        const code_hash = await hashOtp(code);

        const { error: insertErr } = await supabaseAdmin
            .from('otp_codes')
            .insert({ whatsapp, code_hash, expires_at: otpExpiresAt() });
        if (insertErr) throw insertErr;

        await sendOtpViaWhatsApp(whatsapp, code);

        return res.status(200).json({ ok: true, expires_in: OTP_TTL_SECONDS });
    } catch (err) {
        console.error('[otp-request]', err);
        return res.status(500).json({ error: 'Não foi possível enviar o código. Tente novamente.' });
    }
}

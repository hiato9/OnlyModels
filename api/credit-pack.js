// api/credit-pack.js — gera PIX pra compra de pack de OnlyCoins.
// Requer JWT (lead autenticado via WhatsApp OTP). Grava pending_credit_purchases;
// crédito real só entra no balance quando o webhook da Wiinpay confirmar pagamento.

import { applyCors } from './_lib/cors.js';
import { supabaseAdmin } from './_lib/supabase.js';
import { extractBearer, verifySessionToken } from './_lib/jwt.js';
import { createWiinpayPix, buildQrImageUrl } from './_lib/wiinpay.js';

// SKUs hard-coded server-side — cliente NUNCA define preço/quantidade.
// Valores em reais. Wiinpay exige mínimo R$ 3,00.
// media_credits são OnlyMedia bundled no mesmo pack (10 coins por foto).
const PACKS = {
    starter: { credits: 150,  media_credits: 30,  price: 14.90 },
    pro:     { credits: 350,  media_credits: 80,  price: 29.90 },
    boost:   { credits: 800,  media_credits: 200, price: 59.90 },
    whale:   { credits: 2500, media_credits: 600, price: 149.90 },
};

export default async function handler(req, res) {
    const originAllowed = applyCors(req, res);
    if (req.method === 'OPTIONS') return res.status(originAllowed ? 204 : 403).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!originAllowed) return res.status(403).json({ error: 'Origin not allowed' });

    const session = await verifySessionToken(extractBearer(req));
    if (!session) {
        return res.status(401).json({ error: 'Sessão expirada — verifique seu WhatsApp novamente' });
    }

    try {
        const { pack_key } = req.body || {};
        const pack = PACKS[pack_key];
        if (!pack) {
            return res.status(400).json({
                error: 'Pack inválido',
                available: Object.keys(PACKS),
            });
        }

        const description = `OnlyCoins ${pack.credits} (pack ${pack_key})`;
        const callbackUrl = process.env.APP_URL ? `${process.env.APP_URL}/api/wiinpay-webhook` : null;
        const { qr_code, payment_id } = await createWiinpayPix({
            value: pack.price,
            description,
            callbackUrl,
        });

        const { error: insErr } = await supabaseAdmin
            .from('pending_credit_purchases')
            .insert({
                user_id: session.userId,
                payment_id,
                pack_key,
                credits_amount: pack.credits,
                media_credits_amount: pack.media_credits,
                price_brl: pack.price,
                status: 'pending',
            });
        if (insErr) throw insErr;

        return res.status(200).json({
            qr_code,
            qr_code_image_url: buildQrImageUrl(qr_code),
            payment_id,
            pack: { key: pack_key, credits: pack.credits, media_credits: pack.media_credits, price: pack.price },
        });
    } catch (err) {
        console.error('[credit-pack]', err);
        return res.status(500).json({ error: err.message || 'Erro ao criar PIX' });
    }
}

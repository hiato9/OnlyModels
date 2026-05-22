// api/create-pix.js — Wiinpay PIX direto (Premium/VIP unlock — não usa créditos).
// Mantido pro fluxo legado do funil (botão "GERAR PIX AGORA" / offer cards no chat).
// Para compra de pack de OnlyCoins, ver api/credit-pack.js.

import { applyCors } from './_lib/cors.js';
import { createWiinpayPix, buildQrImageUrl } from './_lib/wiinpay.js';

export default async function handler(req, res) {
    const originAllowed = applyCors(req, res);
    if (req.method === 'OPTIONS') return res.status(originAllowed ? 204 : 403).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!originAllowed) return res.status(403).json({ error: 'Origin not allowed' });

    try {
        const { transactionAmount, description } = req.body || {};
        const value = parseFloat(transactionAmount);
        if (!value || isNaN(value)) {
            return res.status(400).json({ error: 'transactionAmount inválido' });
        }

        const { qr_code, payment_id } = await createWiinpayPix({
            value,
            description: description || 'OnlyModels VIP',
        });

        return res.status(200).json({
            qr_code,
            qr_code_image_url: buildQrImageUrl(qr_code),
            payment_id,
        });
    } catch (error) {
        console.error('[create-pix] Erro:', error);
        return res.status(500).json({ error: error.message || 'Failed to generate PIX' });
    }
}

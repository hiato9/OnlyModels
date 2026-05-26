// api/check-pack.js — polling de status do PIX de compra de pack.
// Consulta Wiinpay diretamente; se pago, credita e retorna approved.
// Fallback para quando webhook não chega (Cloudflare bloqueia IP do servidor).

import { applyCors } from './_lib/cors.js';
import { supabaseAdmin } from './_lib/supabase.js';
import { extractBearer, verifySessionToken } from './_lib/jwt.js';
import { checkWiinpayPaymentStatus } from './_lib/wiinpay.js';

async function creditPurchase(pending) {
    const { error: updErr, data: claimed } = await supabaseAdmin
        .from('pending_credit_purchases')
        .update({ status: 'paid', credited_at: new Date().toISOString() })
        .eq('id', pending.id)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle();
    if (updErr) throw updErr;
    if (!claimed) return; // já creditado por outro caminho

    const { error: rpcErr } = await supabaseAdmin.rpc('increment_paid_credits', {
        p_user_id: pending.user_id,
        p_delta: pending.credits_amount,
    });
    if (rpcErr) throw rpcErr;

    await supabaseAdmin.from('credit_transactions').insert({
        user_id: pending.user_id,
        delta: pending.credits_amount,
        reason: 'pack_purchase',
        metadata: { pack_key: pending.pack_key, payment_id: pending.payment_id, price_brl: pending.price_brl },
    });

    if (pending.media_credits_amount > 0) {
        const { error: mediaErr } = await supabaseAdmin.rpc('increment_paid_media_credits', {
            p_user_id: pending.user_id,
            p_delta: pending.media_credits_amount,
        });
        if (mediaErr) throw mediaErr;

        await supabaseAdmin.from('credit_transactions').insert({
            user_id: pending.user_id,
            delta: pending.media_credits_amount,
            reason: 'pack_purchase_media',
            metadata: { pack_key: pending.pack_key, payment_id: pending.payment_id, price_brl: pending.price_brl },
        });
    }
}

export default async function handler(req, res) {
    const originAllowed = applyCors(req, res);
    if (req.method === 'OPTIONS') return res.status(originAllowed ? 204 : 403).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!originAllowed) return res.status(403).json({ error: 'Origin not allowed' });

    const session = await verifySessionToken(extractBearer(req));
    if (!session) return res.status(401).json({ error: 'Sessão expirada' });

    const paymentId = req.query.id;
    if (!paymentId) return res.status(400).json({ error: 'Missing payment id' });

    try {
        const { data: pending, error } = await supabaseAdmin
            .from('pending_credit_purchases')
            .select('id, user_id, pack_key, credits_amount, media_credits_amount, price_brl, payment_id, status')
            .eq('payment_id', paymentId)
            .eq('user_id', session.userId)
            .maybeSingle();
        if (error) throw error;
        if (!pending) return res.status(404).json({ error: 'Pagamento não encontrado' });

        if (pending.status === 'paid') {
            return res.status(200).json({ status: 'approved', credits: pending.credits_amount, media_credits: pending.media_credits_amount });
        }

        // Consulta Wiinpay diretamente
        const wiinpay = await checkWiinpayPaymentStatus(paymentId);
        if (wiinpay.found && wiinpay.paid) {
            await creditPurchase(pending);
            return res.status(200).json({ status: 'approved', credits: pending.credits_amount, media_credits: pending.media_credits_amount });
        }

        return res.status(200).json({ status: 'pending' });
    } catch (err) {
        console.error('[check-pack]', err);
        return res.status(500).json({ error: 'Falha na verificação' });
    }
}

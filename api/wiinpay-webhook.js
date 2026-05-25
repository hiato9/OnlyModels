// api/wiinpay-webhook.js — recebe confirmação de pagamento da Wiinpay e credita OnlyCoins.
//
// CONFIGURAR NO PAINEL WIINPAY:
//   - URL: https://<seu-dominio>/api/wiinpay-webhook
//   - Secret: setar em env WIINPAY_WEBHOOK_SECRET e configurar mesmo valor no header X-Webhook-Secret
//     (ajustar o nome do header se a Wiinpay usar outro — verificar docs deles).
//
// Idempotência garantida via UPDATE WHERE status='pending' — múltiplas entregas do mesmo
// evento creditam só uma vez.

import { supabaseAdmin } from './_lib/supabase.js';

function extractPaymentId(payload) {
    return payload?.payment_id
        || payload?.paymentId
        || payload?.data?.payment_id
        || payload?.data?.paymentId
        || payload?.id
        || null;
}

function extractStatus(payload) {
    const raw = payload?.status
        || payload?.event
        || payload?.data?.status
        || payload?.payment_status
        || '';
    return String(raw).toLowerCase();
}

function isPaidStatus(status) {
    return ['paid', 'approved', 'completed', 'payment.paid', 'payment.approved', 'success'].includes(status);
}

export default async function handler(req, res) {
    // Webhook é server-to-server — não precisa CORS.
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Auth: secret estático em header (ajustar nome se Wiinpay usar outro)
    const expectedSecret = process.env.WIINPAY_WEBHOOK_SECRET;
    if (expectedSecret) {
        const provided = req.headers['x-webhook-secret']
            || req.headers['x-wiinpay-signature']
            || '';
        if (provided !== expectedSecret) {
            console.warn('[webhook] secret mismatch');
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    try {
        const payload = req.body || {};
        const paymentId = extractPaymentId(payload);
        const status = extractStatus(payload);

        if (!paymentId) {
            console.warn('[webhook] payment_id ausente:', JSON.stringify(payload).slice(0, 300));
            return res.status(400).json({ error: 'payment_id missing' });
        }

        if (!isPaidStatus(status)) {
            return res.status(200).json({ ok: true, ignored: true, status });
        }

        const { data: pending, error: selErr } = await supabaseAdmin
            .from('pending_credit_purchases')
            .select('id, user_id, pack_key, credits_amount, media_credits_amount, price_brl, status')
            .eq('payment_id', paymentId)
            .maybeSingle();
        if (selErr) throw selErr;

        if (!pending) {
            // PIX de outro tipo (não é compra de pack) — não é erro.
            return res.status(200).json({ ok: true, ignored: true, reason: 'no pending row' });
        }
        if (pending.status === 'paid') {
            return res.status(200).json({ ok: true, already_credited: true });
        }

        // Guard idempotente — só atualiza se ainda está 'pending'.
        const { data: claimed, error: updErr } = await supabaseAdmin
            .from('pending_credit_purchases')
            .update({ status: 'paid', credited_at: new Date().toISOString() })
            .eq('id', pending.id)
            .eq('status', 'pending')
            .select('id')
            .maybeSingle();
        if (updErr) throw updErr;
        if (!claimed) {
            return res.status(200).json({ ok: true, already_credited: true });
        }

        // Credita OnlyCoins atomicamente via RPC.
        const { error: rpcErr } = await supabaseAdmin.rpc('increment_paid_credits', {
            p_user_id: pending.user_id,
            p_delta: pending.credits_amount,
        });
        if (rpcErr) throw rpcErr;

        await supabaseAdmin.from('credit_transactions').insert({
            user_id: pending.user_id,
            delta: pending.credits_amount,
            reason: 'pack_purchase',
            metadata: {
                pack_key: pending.pack_key,
                payment_id: paymentId,
                price_brl: pending.price_brl,
            },
        });

        // Credita OnlyMedia se o pack incluir media_credits.
        if (pending.media_credits_amount > 0) {
            const { error: mediaRpcErr } = await supabaseAdmin.rpc('increment_paid_media_credits', {
                p_user_id: pending.user_id,
                p_delta: pending.media_credits_amount,
            });
            if (mediaRpcErr) throw mediaRpcErr;

            await supabaseAdmin.from('credit_transactions').insert({
                user_id: pending.user_id,
                delta: pending.media_credits_amount,
                reason: 'pack_purchase_media',
                metadata: {
                    pack_key: pending.pack_key,
                    payment_id: paymentId,
                    price_brl: pending.price_brl,
                },
            });
        }

        return res.status(200).json({
            ok: true,
            credited: pending.credits_amount,
            media_credited: pending.media_credits_amount,
        });
    } catch (err) {
        console.error('[webhook]', err);
        return res.status(500).json({ error: 'Webhook processing failed' });
    }
}

// api/credits-balance.js — devolve saldo de OnlyCoins pagos (autenticado via Bearer JWT).
// Free credits ficam no localStorage do cliente, não passam por aqui.

import { applyCors } from './_lib/cors.js';
import { supabaseAdmin } from './_lib/supabase.js';
import { extractBearer, verifySessionToken } from './_lib/jwt.js';

export default async function handler(req, res) {
    const originAllowed = applyCors(req, res, { methods: 'GET, OPTIONS' });
    if (req.method === 'OPTIONS') return res.status(originAllowed ? 204 : 403).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!originAllowed) return res.status(403).json({ error: 'Origin not allowed' });

    const session = await verifySessionToken(extractBearer(req));
    if (!session) return res.status(401).json({ error: 'Sessão expirada' });

    try {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('paid_credits_balance, paid_media_credits_balance')
            .eq('id', session.userId)
            .single();
        if (error) throw error;
        return res.status(200).json({
            paid_balance: data?.paid_credits_balance ?? 0,
            paid_media_balance: data?.paid_media_credits_balance ?? 0,
        });
    } catch (err) {
        console.error('[credits-balance]', err);
        return res.status(500).json({ error: 'Erro ao consultar saldo' });
    }
}

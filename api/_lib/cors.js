// api/_lib/cors.js — CORS compartilhado entre todos os endpoints.

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://onlymodels-five.vercel.app')
    .split(',').map(s => s.trim()).filter(Boolean);
const VERCEL_PREVIEW_RE = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

export function applyCors(req, res, { methods = 'POST, OPTIONS' } = {}) {
    const origin = req.headers.origin || '';
    const allowed = ALLOWED_ORIGINS.includes(origin) || VERCEL_PREVIEW_RE.test(origin);
    if (allowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', methods);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    return allowed;
}

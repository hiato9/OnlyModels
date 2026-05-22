// api/_lib/jwt.js — assina/valida session JWT (HS256, 1h).

import { SignJWT, jwtVerify } from 'jose';

const ISSUER = 'onlymodels';
const TTL_SECONDS = 60 * 60;

function getSecret() {
    const raw = process.env.JWT_SECRET;
    if (!raw) {
        throw new Error('JWT_SECRET não configurado');
    }
    return new TextEncoder().encode(raw);
}

export async function signSessionToken({ userId, whatsapp }) {
    return await new SignJWT({ wa: whatsapp })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuer(ISSUER)
        .setSubject(userId)
        .setIssuedAt()
        .setExpirationTime(`${TTL_SECONDS}s`)
        .sign(getSecret());
}

export async function verifySessionToken(token) {
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, getSecret(), { issuer: ISSUER });
        return { userId: payload.sub, whatsapp: payload.wa };
    } catch {
        return null;
    }
}

export function extractBearer(req) {
    const h = req.headers.authorization || req.headers.Authorization;
    if (!h || typeof h !== 'string') return null;
    const m = h.match(/^Bearer\s+(.+)$/i);
    return m ? m[1] : null;
}

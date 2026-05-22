// services/wa-otp/index.js
// Microserviço WhatsApp OTP — usa Baileys (WhatsApp Web protocol não-oficial).
// Único endpoint útil: POST /send-otp  (auth via X-API-Secret).
// Roda na VM Oracle 1GB. Reconecta sozinho exceto em loggedOut (precisa rescan).

import express from 'express';
import baileys, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';

const makeWASocket = baileys.default || baileys;

const PORT = parseInt(process.env.PORT || '3000', 10);
const API_SECRET = process.env.WA_OTP_SERVICE_SECRET;
const AUTH_DIR = process.env.AUTH_DIR || './auth-data';

if (!API_SECRET) {
    console.error('FATAL: WA_OTP_SERVICE_SECRET env var é obrigatório');
    process.exit(1);
}

const logger = pino({ level: process.env.LOG_LEVEL || 'warn' });

let sock = null;
let isConnected = false;
let connectAttempts = 0;

async function startWA() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger,
        browser: ['OnlyModels OTP', 'Chrome', '120.0.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('[wa-otp] QR code acima — escaneie com o WhatsApp do número dedicado.');
        }
        if (connection === 'open') {
            isConnected = true;
            connectAttempts = 0;
            console.log('[wa-otp] WhatsApp conectado.');
        } else if (connection === 'close') {
            isConnected = false;
            const code = (lastDisconnect?.error instanceof Boom)
                ? lastDisconnect.error.output?.statusCode
                : undefined;
            const shouldReconnect = code !== DisconnectReason.loggedOut;
            console.log(`[wa-otp] Conexão fechada (code=${code}). Reconectar: ${shouldReconnect}`);
            if (shouldReconnect) {
                connectAttempts += 1;
                const delay = Math.min(30_000, 1000 * 2 ** Math.min(connectAttempts, 5));
                setTimeout(() => { startWA().catch(err => console.error('[wa-otp] reconnect failed:', err)); }, delay);
            } else {
                console.error('[wa-otp] LOGGED OUT — apague auth-data e re-escaneie o QR.');
            }
        }
    });
}

function authMiddleware(req, res, next) {
    const provided = req.headers['x-api-secret'];
    if (provided !== API_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// "+5511999999999" → "5511999999999@s.whatsapp.net"
function toJid(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
        throw new Error('Número inválido');
    }
    return `${digits}@s.whatsapp.net`;
}

function buildOtpText(code) {
    return (
        `🔐 *OnlyModels — verificação*\n\n` +
        `Seu código: *${code}*\n\n` +
        `Válido por 5 minutos. Se não foi você, ignore.`
    );
}

const app = express();
app.use(express.json({ limit: '10kb' }));

app.get('/healthz', (req, res) => {
    res.json({ ok: true, wa_connected: isConnected });
});

app.post('/send-otp', authMiddleware, async (req, res) => {
    if (!isConnected || !sock) {
        return res.status(503).json({ error: 'WhatsApp não conectado' });
    }
    const { phone, code } = req.body || {};
    if (!phone || !/^\d{6}$/.test(String(code || ''))) {
        return res.status(400).json({ error: 'phone e code (6 dígitos) obrigatórios' });
    }
    try {
        const jid = toJid(phone);
        await sock.sendMessage(jid, { text: buildOtpText(code) });
        res.json({ ok: true });
    } catch (err) {
        console.error('[wa-otp] send-otp falhou:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[wa-otp] HTTP listening on :${PORT}`);
});

startWA().catch(err => {
    console.error('[wa-otp] startWA falhou:', err);
    process.exit(1);
});

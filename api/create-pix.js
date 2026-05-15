// api/create-pix.js — Wiinpay PIX (sem coleta de dados do comprador)

const WIINPAY_BASE = 'https://api-v2.wiinpay.com.br';
const TIMEOUT_MS = 15000;

// Cache em memória entre cold-starts (não confiável em serverless, mas economiza chamadas)
let _cachedApiKey = null;

async function loginAndFetchApiKey() {
    const email = process.env.WIINPAY_EMAIL;
    const password = process.env.WIINPAY_PASSWORD;
    const keyName = process.env.WIINPAY_KEY_NAME || 'op emerald';

    if (!email || !password) {
        throw new Error('WIINPAY_EMAIL/PASSWORD não configurados — impossível recuperar api_key');
    }

    const loginRes = await fetch(`${WIINPAY_BASE}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData?.data?.token) {
        throw new Error(`Wiinpay login falhou (${loginRes.status}): ${JSON.stringify(loginData).slice(0, 200)}`);
    }
    const sessionToken = loginData.data.token;

    const listRes = await fetch(`${WIINPAY_BASE}/api-key/list`, {
        headers: { 'Authorization': `Bearer ${sessionToken}`, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const listData = await listRes.json();
    const tokens = listData?.data?.tokens || [];
    if (!tokens.length) {
        throw new Error('Nenhuma api-key cadastrada em wiinpay.com.br/chaves-api');
    }
    const found = tokens.find(t => t.name === keyName) || tokens[0];
    _cachedApiKey = found.token;
    return _cachedApiKey;
}

async function ensureApiKey(forceRefresh = false) {
    if (!forceRefresh && _cachedApiKey) return _cachedApiKey;
    if (!forceRefresh && process.env.WIINPAY_API_KEY) {
        _cachedApiKey = process.env.WIINPAY_API_KEY.trim();
        return _cachedApiKey;
    }
    return await loginAndFetchApiKey();
}

async function createWiinpayPix({ value, description }) {
    if (!value || value <= 0) throw new Error('value obrigatório e > 0');
    if (value < 3) throw new Error(`Wiinpay exige valor mínimo R$ 3,00 (recebido R$ ${value.toFixed(2)})`);

    const amountCents = Math.round(value * 100);
    let apiKey = await ensureApiKey();
    let triedRecovery = false;

    while (true) {
        const body = {
            api_key: apiKey,
            amount: amountCents,
            value: value,
            valor: value,
            name: 'Cliente OnlyModels',
            email: 'cliente@onlymodels.com',
            description: description || `OnlyModels — R$ ${value.toFixed(2)}`,
        };

        const res = await fetch(`${WIINPAY_BASE}/payment/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        const data = await res.json().catch(() => ({}));

        if (res.status === 200 || res.status === 201) {
            const qr = data?.data?.qr_code || data?.qr_code;
            const pid = data?.data?.paymentId || data?.paymentId;
            if (!qr) throw new Error(`Resposta Wiinpay sem qr_code: ${JSON.stringify(data).slice(0, 300)}`);
            return { qr_code: qr, payment_id: pid };
        }

        // Auto-recovery: 422 com mensagem mencionando "chave" e "api" → refaz login
        const errMsg = typeof data?.error?.message === 'string'
            ? data.error.message
            : JSON.stringify(data).slice(0, 200);
        const isAuthErr =
            res.status === 422 &&
            errMsg.toLowerCase().includes('chave') &&
            errMsg.toLowerCase().includes('api');

        if (isAuthErr && !triedRecovery && process.env.WIINPAY_EMAIL && process.env.WIINPAY_PASSWORD) {
            triedRecovery = true;
            apiKey = await ensureApiKey(true);
            continue;
        }

        throw new Error(`Wiinpay /payment/create [${res.status}]: ${errMsg}`);
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

        // Imagem do QR via serviço público (Wiinpay não retorna base64)
        const qr_code_image_url =
            `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr_code)}`;

        return res.status(200).json({
            qr_code,
            qr_code_image_url,
            payment_id,
        });
    } catch (error) {
        console.error('[create-pix] Erro:', error);
        return res.status(500).json({ error: error.message || 'Failed to generate PIX' });
    }
}

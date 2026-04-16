const { MercadoPagoConfig, Payment } = require('mercadopago');

// Set up Mercado Pago Client
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-5238277782838185-022119-7012073cb2ab2a45bd57ba433b024469-455113527' });
const payment = new Payment(client);

export default async function handler(req, res) {
    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { transactionAmount, description, email, cpf, name } = req.body;

        let firstName = 'Cliente';
        let lastName = 'OnlyModels';
        if (name) {
            const nameParts = name.trim().split(' ');
            firstName = nameParts[0];
            if (nameParts.length > 1) {
                lastName = nameParts.slice(1).join(' ');
            }
        }

        let cleanCpf = cpf ? cpf.replace(/\D/g, '') : '';
        if (cleanCpf.length !== 11) {
            return res.status(400).json({ error: 'CPF inválido.' });
        }

        const body = {
            transaction_amount: transactionAmount || 34.90,
            description: description || 'OnlyModels VIP',
            payment_method_id: 'pix',
            payer: {
                email: email || 'cliente@onlymodels.com',
                first_name: firstName,
                last_name: lastName,
                identification: {
                    type: 'CPF',
                    number: cleanCpf
                }
            }
        };

        const response = await payment.create({ body });

        res.status(200).json({
            qr_code: response.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64,
            payment_id: response.id
        });

    } catch (error) {
        console.error("Error creating PIX:", error);
        res.status(500).json({ error: 'Failed to generate PIX' });
    }
}

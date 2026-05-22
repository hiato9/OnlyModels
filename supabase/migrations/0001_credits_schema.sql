-- 0001_credits_schema.sql
-- OnlyCoins (sistema de créditos) — identidade via WhatsApp OTP.
-- Apply: cole no SQL Editor do Supabase (painel) ou rode via `supabase db push`.

-- pgcrypto e uuid-ossp já vêm habilitados no Supabase por padrão.
-- gen_random_uuid() é nativo do Postgres 13+.

-- ============================================================
-- USERS: identidade ancorada no número de WhatsApp (E.164).
-- Free credits NÃO ficam aqui (são client-side, localStorage).
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp TEXT NOT NULL UNIQUE,
    paid_credits_balance INTEGER NOT NULL DEFAULT 0 CHECK (paid_credits_balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_whatsapp ON users (whatsapp);

-- ============================================================
-- OTP_CODES: códigos de 6 dígitos hashed (bcrypt+pepper).
-- TTL 5 min, max 5 tentativas. Codes anteriores são invalidados
-- ao requisitar novo (marcar used_at no momento do request).
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_whatsapp_active
    ON otp_codes (whatsapp, created_at DESC)
    WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_otp_codes_recent
    ON otp_codes (whatsapp, created_at DESC);

-- ============================================================
-- CREDIT_TRANSACTIONS: ledger imutável de movimentos.
-- delta positivo = crédito (compra), negativo = débito (gasto).
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delta INTEGER NOT NULL,
    reason TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user
    ON credit_transactions (user_id, created_at DESC);

-- ============================================================
-- PENDING_CREDIT_PURCHASES: PIX gerado, aguardando webhook
-- da Wiinpay confirmar. Idempotência via status + UPDATE guard.
-- ============================================================
CREATE TABLE IF NOT EXISTS pending_credit_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_id TEXT NOT NULL UNIQUE,
    pack_key TEXT NOT NULL,
    credits_amount INTEGER NOT NULL CHECK (credits_amount > 0),
    price_brl NUMERIC(10,2) NOT NULL CHECK (price_brl > 0),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'expired', 'canceled')),
    credited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pending_purchases_payment_id
    ON pending_credit_purchases (payment_id);
CREATE INDEX IF NOT EXISTS idx_pending_purchases_user_status
    ON pending_credit_purchases (user_id, status);

-- ============================================================
-- RPC atômico — increment_paid_credits.
-- Usado pelo webhook pra evitar race condition entre múltiplas
-- entregas paralelas do mesmo evento.
-- ============================================================
CREATE OR REPLACE FUNCTION increment_paid_credits(
    p_user_id UUID,
    p_delta INTEGER
) RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE users
       SET paid_credits_balance = paid_credits_balance + p_delta
     WHERE id = p_user_id;
$$;

-- ============================================================
-- RLS: tranca tudo. O backend usa SERVICE_ROLE_KEY que bypassa
-- RLS. Nenhum cliente (anon/authenticated) acessa essas tabelas
-- diretamente.
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_credit_purchases ENABLE ROW LEVEL SECURITY;

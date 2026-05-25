-- 0002_media_credits.sql — adiciona sistema de OnlyMedia (segunda moeda).
--
-- Aplicar no Supabase antes de deployar as mudanças de API/frontend.

-- Saldo de mídia pago (identity-bound, mesmo padrão de paid_credits_balance)
ALTER TABLE users
    ADD COLUMN paid_media_credits_balance INTEGER NOT NULL DEFAULT 0
        CHECK (paid_media_credits_balance >= 0);

-- Coluna na tabela de compras pendentes para registrar media credits bundled
ALTER TABLE pending_credit_purchases
    ADD COLUMN media_credits_amount INTEGER NOT NULL DEFAULT 0;

-- RPC atômico — mesmo padrão de increment_paid_credits
CREATE OR REPLACE FUNCTION increment_paid_media_credits(
    p_user_id UUID,
    p_delta INTEGER
) RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE users
       SET paid_media_credits_balance = paid_media_credits_balance + p_delta
     WHERE id = p_user_id;
$$;

REVOKE EXECUTE ON FUNCTION increment_paid_media_credits(UUID, INTEGER)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_paid_media_credits(UUID, INTEGER)
    TO service_role;

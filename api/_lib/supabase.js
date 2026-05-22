// api/_lib/supabase.js — cliente Supabase admin (service_role).
// Bypassa RLS — usar APENAS em código server-side (api/*).

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
    console.error('[supabase] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente');
}

export const supabaseAdmin = createClient(url || '', serviceKey || '', {
    auth: { autoRefreshToken: false, persistSession: false },
});

// ============================================================
// FlowCRM — Cliente Supabase (opcional)
// La app funciona en modo demo sin Supabase. Si defines las
// variables de entorno, este cliente queda disponible para
// reemplazar el store en memoria por persistencia real.
// ============================================================
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseEnabled =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase" &&
  Boolean(url) &&
  Boolean(anonKey);

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseEnabled || !url || !anonKey) return null;
  if (!_client) {
    _client = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return _client;
}

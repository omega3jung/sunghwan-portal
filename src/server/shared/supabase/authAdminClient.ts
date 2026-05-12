import { createClient } from "@supabase/supabase-js";

// login authorization only.
// Supabase secret key use.

type SupabaseEnvKey = "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SECRET_KEY";

function getRequiredEnv(key: SupabaseEnvKey): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`[supabase] Missing required environment variable: ${key}`);
  }

  return value;
}

export function createSupabaseAuthClient() {
  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseSecretKey = getRequiredEnv("SUPABASE_SECRET_KEY");

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

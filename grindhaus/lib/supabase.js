import { createClient } from "@supabase/supabase-js";

let supabaseClient;

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Restart the dev server after editing .env.local.",
    );
  }

  const parsedSupabaseUrl = new URL(supabaseUrl);

  if (
    parsedSupabaseUrl.protocol !== "https:" ||
    !parsedSupabaseUrl.hostname.endsWith(".supabase.co") ||
    parsedSupabaseUrl.pathname !== "/"
  ) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be only your Supabase project base URL, like https://project-ref.supabase.co. Do not include /rest/v1.");
  }

  if (!supabaseAnonKey.startsWith("eyJ")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY must be the Supabase anon public JWT key.");
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}

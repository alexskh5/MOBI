import {
  createClient,
} from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env
    .VITE_SUPABASE_URL;

const supabasePublishableKey =
  import.meta.env
    .VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env
    .VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing VITE_SUPABASE_URL in mobi-web environment.",
  );
}

if (
  !supabasePublishableKey
) {
  throw new Error(
    "Missing VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) in mobi-web environment.",
  );
}

/*
  This is SAFE in the browser because it uses the publishable/anon key,
  never the backend secret/service-role key.
*/
export const supabaseAuth =
  createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        persistSession:
          true,
        autoRefreshToken:
          true,
        detectSessionInUrl:
          false,
      },
    },
  );

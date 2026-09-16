import {
  createClient,
} from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL;

const supabasePublicKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing SUPABASE_URL in mobi-backend/.env",
  );
}

if (!supabasePublicKey) {
  throw new Error(
    "Missing SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY) in mobi-backend/.env",
  );
}

/*
  Public Auth client for normal OTP send/verify operations.
  Admin/database operations continue using the existing backend supabase client.
*/
export const supabaseAuth =
  createClient(
    supabaseUrl,
    supabasePublicKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );

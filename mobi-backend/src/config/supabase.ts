// import { createClient } from "@supabase/supabase-js";
// import dotenv from "dotenv";

// dotenv.config();

// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// if (!supabaseUrl || !supabaseServiceKey) {
//   throw new Error("Missing Supabase environment variables.");
// }

// export const supabase = createClient(supabaseUrl, supabaseServiceKey);
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

function createSupabaseClient(options: Record<string, unknown> = {}) {
  const {
    createClient,
  } = require("@supabase/supabase-js");
  const ws = require("ws");

  return createClient(supabaseUrl, supabaseServiceKey, {
    ...options,
    realtime: {
      transport: ws,
    },
  });
}

function createLazyClient(
  options: Record<string, unknown> = {},
) {
  let client: any = null;

  return new Proxy(
    {},
    {
      get(_target, property) {
        if (!client) {
          client = createSupabaseClient(options);
        }

        const value = client[property];
        return typeof value === "function"
          ? value.bind(client)
          : value;
      },
    },
  ) as any;
}

export const supabase = createLazyClient();

export const supabaseAdmin = createLazyClient({
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

export const supabaseAuth = createLazyClient({
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

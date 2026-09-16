// // import { createClient } from "@supabase/supabase-js";
// // import dotenv from "dotenv";

// // dotenv.config();

// // const supabaseUrl = process.env.SUPABASE_URL;
// // const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// // if (!supabaseUrl || !supabaseServiceKey) {
// //   throw new Error("Missing Supabase environment variables.");
// // }

// // export const supabase = createClient(supabaseUrl, supabaseServiceKey);


// import { createClient } from "@supabase/supabase-js";
// import ws from "ws";
// import dotenv from "dotenv";

// dotenv.config();

// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// if (!supabaseUrl || !supabaseServiceKey) {
//   throw new Error("Missing Supabase environment variables");
// }

// export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
//   realtime: {
//     transport: ws as any,
//   },
// });



// kz adjustrment sep 3 2026

import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import dotenv from "dotenv";

dotenv.config();

/* =========================================================
   ENVIRONMENT VARIABLES
========================================================= */

const supabaseUrl =
  process.env.SUPABASE_URL;

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_ANON_KEY;

/* =========================================================
   VALIDATION
========================================================= */

if (!supabaseUrl) {
  throw new Error(
    "Missing SUPABASE_URL in mobi-backend/.env",
  );
}

if (!supabaseServiceKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY in mobi-backend/.env",
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "Missing SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY) in mobi-backend/.env",
  );
}

/* =========================================================
   ADMIN / DATABASE CLIENT

   Use this for:
   - Database queries
   - CRUD
   - auth.admin.listUsers()
   - auth.admin.deleteUser()

   Uses SERVICE ROLE KEY.
========================================================= */

export const supabase =
  createClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },

      realtime: {
        transport: ws as any,
      },
    },
  );

/* =========================================================
   STAFF AUTH CLIENT

   Use this only for:
   - signInWithOtp()
   - verifyOtp()

   Uses PUBLISHABLE KEY.
========================================================= */

export const supabaseAuth =
  createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },

      realtime: {
        transport: ws as any,
      },
    },
  );
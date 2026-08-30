import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const IS_SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey);

if (!IS_SUPABASE_CONFIGURED) {
  // Jangan `throw` di sini — itu bikin SELURUH APLIKASI crash (layar putih)
  // begitu file ini di-import, sebelum React sempat render apa pun.
  // Cukup warning; komponen yang butuh Supabase akan gagal secara lokal
  // (bisa ditangani lewat try/catch atau error state), bukan mematikan app.
  console.warn(
    '[KawalDana] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diisi di .env. ' +
      'Fitur yang butuh database (laporan warga, DAO, dsb.) tidak akan berfungsi ' +
      'sampai variabel ini diisi.',
  );
}

// Kalau env var kosong, `supabase` diisi Proxy yang melempar error jelas
// HANYA ketika benar-benar dipanggil (mis. supabase.from(...)) — bukan saat
// file ini di-import. Ini yang mencegah white-screen crash.
export const supabase: SupabaseClient = IS_SUPABASE_CONFIGURED
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: false },
    })
  : (new Proxy(
      {},
      {
        get() {
          throw new Error(
            'Supabase belum dikonfigurasi (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY kosong di .env).',
          );
        },
      },
    ) as SupabaseClient);
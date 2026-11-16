/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** Número de WhatsApp en formato internacional, sin "+" (ej. 51999999999). */
  readonly PUBLIC_WHATSAPP_NUMBER?: string;
  /** URL del proyecto Supabase. */
  readonly PUBLIC_SUPABASE_URL: string;
  /** Clave pública (anon) de Supabase. */
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

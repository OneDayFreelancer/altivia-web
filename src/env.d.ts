/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** Número de WhatsApp en formato internacional, sin "+" (ej. 51999999999). */
  readonly PUBLIC_WHATSAPP_NUMBER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

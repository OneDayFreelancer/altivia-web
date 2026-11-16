import { createClient } from '@supabase/supabase-js';

/** Cliente Supabase compartido (solo cliente; el sitio es estático). */
export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
);

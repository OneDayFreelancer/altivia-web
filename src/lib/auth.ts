import { supabase } from '@/lib/supabase';

export const PASSWORD_MIN_LENGTH = 8;
const PHONE_RE = /^9\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Cada validador devuelve el mensaje de error, o `undefined` si el valor es válido. */
export const validateName = (v: string): string | undefined =>
  v.trim().length < 2 ? 'Ingresa tu nombre completo.' : undefined;

export const validatePhone = (v: string): string | undefined =>
  PHONE_RE.test(v) ? undefined : 'Ingresa un celular de 9 dígitos que empiece con 9.';

export const validateEmail = (v: string): string | undefined =>
  EMAIL_RE.test(v.trim()) ? undefined : 'Ingresa un correo válido.';

export const validatePassword = (v: string): string | undefined =>
  v.length < PASSWORD_MIN_LENGTH
    ? `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`
    : undefined;

/** Deja solo dígitos (el celular se escribe a veces con espacios). */
export const digitsOnly = (v: string): string => v.replace(/\D/g, '');

/** URL absoluta de retorno de verificación de correo y OAuth. */
export const confirmedUrl = (): string => `${window.location.origin}/auth/confirmado`;

/** Traduce errores de Supabase Auth a mensajes claros. */
export function authErrorMessage(error: { code?: string; message: string }): string {
  switch (error.code) {
    case 'user_already_exists':
    case 'email_exists':
      return 'Este correo ya está registrado. Inicia sesión.';
    case 'weak_password':
      return 'La contraseña es muy débil. Usa una más larga o variada.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
    case 'email_address_invalid':
      return 'El correo no es válido.';
    default:
      return 'No pudimos completar la acción. Inténtalo de nuevo.';
  }
}

/** Destino tras autenticarse: `/completar-perfil` si falta el celular, si no el inicio. */
export async function destinationAfterAuth(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data?.phone ? '/' : '/completar-perfil';
}

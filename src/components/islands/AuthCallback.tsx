import { useEffect, useState } from 'preact/hooks';
import { currentNext, destinationAfterAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

/** Retorno del enlace de verificación y de Google: confirma la sesión y redirige. */
export default function AuthCallback() {
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get('error')) {
      setError(
        'El enlace no es válido o venció. Solicita otro enlace desde el registro o el inicio de sesión.',
      );
      return;
    }
    // getSession espera a que el cliente procese el token de la URL.
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!data.session) {
          setError('No pudimos confirmar tu cuenta. Inténtalo de nuevo.');
          return;
        }
        window.location.replace(await destinationAfterAuth(data.session.user.id, currentNext()));
      })
      .catch(() => setError('No pudimos confirmar tu cuenta. Inténtalo de nuevo.'));
  }, []);

  if (error) {
    return (
      <div role="alert" class="flex flex-col gap-4">
        <p class="text-body text-text-muted">{error}</p>
        <a href="/registro" class="text-small font-semibold underline">
          Volver al registro
        </a>
      </div>
    );
  }
  return (
    <p role="status" class="text-body text-text-muted">
      Confirmando tu cuenta…
    </p>
  );
}

import { useEffect, useState } from 'preact/hooks';
import { authErrorMessage, PASSWORD_MIN_LENGTH, validatePassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { alertBox, field, fieldError, hint, label, primaryBtn } from './formStyles';

/** Retorno del enlace de recuperación: fija la nueva contraseña. */
export default function ResetPasswordForm() {
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.get('error')) {
      setInvalid(true);
      return;
    }
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    // getSession espera a que el cliente procese el token de la URL.
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session) setReady(true);
      else setInvalid(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: Event) => {
    e.preventDefault();
    if (busy) return;
    const err = validatePassword(password);
    setError(err ?? '');
    setFormError('');
    if (err) {
      document.getElementById('rp-password')?.focus();
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setFormError(authErrorMessage(updateError));
      return;
    }
    setDone(true);
    window.setTimeout(() => window.location.replace('/'), 1500);
  };

  if (done) {
    return (
      <p role="status" class="text-body text-text-muted">
        Contraseña actualizada. Te llevamos al sitio…
      </p>
    );
  }

  if (invalid && !ready) {
    return (
      <div role="alert" class="flex flex-col gap-4">
        <p class="text-body text-text-muted">El enlace no es válido o venció.</p>
        <a href="/recuperar" class="text-small font-semibold underline">
          Solicitar otro enlace
        </a>
      </div>
    );
  }

  if (!ready) {
    return (
      <p role="status" class="text-body text-text-muted">
        Verificando enlace…
      </p>
    );
  }

  return (
    <form class="flex flex-col gap-4" onSubmit={submit} noValidate>
      {formError && (
        <p role="alert" class={alertBox}>
          {formError}
        </p>
      )}
      <div class="flex flex-col gap-1">
        <label for="rp-password" class={label}>
          Nueva contraseña
        </label>
        <input
          id="rp-password"
          class={field}
          type="password"
          autoComplete="new-password"
          value={password}
          onInput={(e) => setPassword(e.currentTarget.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'rp-password-hint rp-password-error' : 'rp-password-hint'}
        />
        <p id="rp-password-hint" class={hint}>
          Mínimo {PASSWORD_MIN_LENGTH} caracteres.
        </p>
        {error && (
          <p id="rp-password-error" class={fieldError}>
            {error}
          </p>
        )}
      </div>
      <button type="submit" class={primaryBtn} disabled={busy}>
        {busy ? 'Guardando…' : 'Guardar contraseña'}
      </button>
    </form>
  );
}

import { useState } from 'preact/hooks';
import { authErrorMessage, resetUrl, validateEmail } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { alertBox, field, fieldError, label, primaryBtn } from './formStyles';

/** Pide el correo y envía el enlace de recuperación. */
export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const submit = async (e: Event) => {
    e.preventDefault();
    if (busy) return;
    const err = validateEmail(email);
    setError(err ?? '');
    setFormError('');
    if (err) {
      document.getElementById('fp-email')?.focus();
      return;
    }
    setBusy(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: resetUrl(),
    });
    setBusy(false);
    if (resetError) {
      setFormError(authErrorMessage(resetError));
      return;
    }
    // Mensaje neutro: no revela si el correo existe.
    setSentTo(email.trim());
  };

  if (sentTo) {
    return (
      <div role="status" class="flex flex-col gap-3">
        <h2 class="text-h4 font-semibold">Revisa tu correo</h2>
        <p class="text-body text-text-muted">
          Si <strong class="text-text">{sentTo}</strong> tiene una cuenta, te enviamos un enlace
          para crear una nueva contraseña.
        </p>
      </div>
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
        <label for="fp-email" class={label}>
          Correo
        </label>
        <input
          id="fp-email"
          class={field}
          type="email"
          autoComplete="email"
          value={email}
          onInput={(e) => setEmail(e.currentTarget.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'fp-email-error' : undefined}
        />
        {error && (
          <p id="fp-email-error" class={fieldError}>
            {error}
          </p>
        )}
      </div>
      <button type="submit" class={primaryBtn} disabled={busy}>
        {busy ? 'Enviando…' : 'Enviar enlace'}
      </button>
    </form>
  );
}

import { useEffect, useState } from 'preact/hooks';
import {
  authErrorMessage,
  confirmedUrl,
  currentNext,
  destinationAfterAuth,
  validateEmail,
} from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { alertBox, field, fieldError, label, outlineBtn, primaryBtn } from './formStyles';
import GoogleIcon from './GoogleIcon';

type Errors = Partial<Record<'email' | 'password', string>>;

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [unverified, setUnverified] = useState(false);
  const [resent, setResent] = useState(false);
  const [busy, setBusy] = useState(false);

  // Un usuario con sesión no necesita iniciar sesión otra vez.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace(currentNext());
    });
  }, []);

  const submit = async (e: Event) => {
    e.preventDefault();
    if (busy) return;
    const next: Errors = {
      email: validateEmail(email),
      password: password ? undefined : 'Ingresa tu contraseña.',
    };
    setErrors(next);
    setFormError('');
    setUnverified(false);
    setResent(false);
    if (next.email || next.password) {
      document.getElementById(next.email ? 'li-email' : 'li-password')?.focus();
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setBusy(false);
      setFormError(authErrorMessage(error));
      setUnverified(error.code === 'email_not_confirmed');
      return;
    }
    try {
      window.location.replace(await destinationAfterAuth(data.user.id, currentNext()));
    } catch {
      window.location.replace(currentNext());
    }
  };

  const google = async () => {
    if (busy) return;
    setBusy(true);
    setFormError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: confirmedUrl(currentNext()) },
    });
    if (error) {
      setBusy(false);
      setFormError(authErrorMessage(error));
    }
  };

  const resend = async () => {
    if (busy) return;
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: confirmedUrl() },
    });
    setBusy(false);
    if (error) setFormError(authErrorMessage(error));
    else setResent(true);
  };

  const describedBy = (id: keyof Errors) => (errors[id] ? `li-${id}-error` : undefined);

  return (
    <div class="flex flex-col gap-5">
      <button type="button" class={outlineBtn} onClick={google} disabled={busy}>
        <GoogleIcon />
        Continuar con Google
      </button>

      <p class="text-center text-small text-text-muted" aria-hidden="true">
        o con tu correo
      </p>

      <form class="flex flex-col gap-4" onSubmit={submit} noValidate>
        {formError && (
          <div role="alert" class={`${alertBox} flex flex-col gap-2`}>
            <p>{formError}</p>
            {unverified && (
              <button
                type="button"
                class="self-start text-small font-semibold underline disabled:opacity-50"
                onClick={resend}
                disabled={busy}
              >
                Reenviar correo de verificación
              </button>
            )}
          </div>
        )}
        {resent && (
          <p role="status" class="text-small text-text-muted">
            Te enviamos otro enlace a <strong class="text-text">{email.trim()}</strong>.
          </p>
        )}

        <div class="flex flex-col gap-1">
          <label for="li-email" class={label}>
            Correo
          </label>
          <input
            id="li-email"
            class={field}
            type="email"
            autoComplete="email"
            value={email}
            onInput={(e) => setEmail(e.currentTarget.value)}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={describedBy('email')}
          />
          {errors.email && (
            <p id="li-email-error" class={fieldError}>
              {errors.email}
            </p>
          )}
        </div>

        <div class="flex flex-col gap-1">
          <label for="li-password" class={label}>
            Contraseña
          </label>
          <input
            id="li-password"
            class={field}
            type="password"
            autoComplete="current-password"
            value={password}
            onInput={(e) => setPassword(e.currentTarget.value)}
            aria-invalid={errors.password ? 'true' : undefined}
            aria-describedby={describedBy('password')}
          />
          {errors.password && (
            <p id="li-password-error" class={fieldError}>
              {errors.password}
            </p>
          )}
          <a href="/recuperar" class="self-start text-small font-semibold underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <button type="submit" class={primaryBtn} disabled={busy}>
          {busy ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}

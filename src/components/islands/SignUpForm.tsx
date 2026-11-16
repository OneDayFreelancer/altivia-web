import { useEffect, useState } from 'preact/hooks';
import {
  authErrorMessage,
  confirmedUrl,
  digitsOnly,
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { alertBox, field, fieldError, hint, label, outlineBtn, primaryBtn } from './formStyles';

type Errors = Partial<Record<'name' | 'phone' | 'email' | 'password', string>>;

const GoogleIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
    <path
      fill="#EA4335"
      d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"
    />
    <path
      fill="#FBBC05"
      d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
    />
  </svg>
);

export default function SignUpForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState('');

  // Un usuario con sesión no puede registrarse otra vez.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace('/');
    });
  }, []);

  const submit = async (e: Event) => {
    e.preventDefault();
    if (busy) return;
    const next: Errors = {
      name: validateName(name),
      phone: validatePhone(phone),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(next);
    setFormError('');
    if (Object.values(next).some(Boolean)) {
      document
        .getElementById(`su-${Object.keys(next).find((k) => next[k as keyof Errors])}`)
        ?.focus();
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim(), phone }, emailRedirectTo: confirmedUrl() },
    });
    setBusy(false);
    if (error) {
      setFormError(authErrorMessage(error));
      return;
    }
    // Con "Confirm email" activo, un correo ya registrado no da error: llega sin identidades.
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      setFormError('Este correo ya está registrado. Inicia sesión.');
      return;
    }
    setSentTo(email.trim());
  };

  const google = async () => {
    if (busy) return;
    setBusy(true);
    setFormError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: confirmedUrl() },
    });
    if (error) {
      setBusy(false);
      setFormError(authErrorMessage(error));
    }
  };

  if (sentTo) {
    return (
      <div role="status" class="flex flex-col gap-3">
        <h2 class="text-h4 font-semibold">Revisa tu correo para verificar tu cuenta</h2>
        <p class="text-body text-text-muted">
          Enviamos un enlace a <strong class="text-text">{sentTo}</strong>. Ábrelo para activar tu
          cuenta. Hasta entonces no podrás iniciar sesión.
        </p>
      </div>
    );
  }

  const describedBy = (id: keyof Errors, extra?: string) =>
    [errors[id] ? `su-${id}-error` : '', extra ?? ''].filter(Boolean).join(' ') || undefined;

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
          <p role="alert" class={alertBox}>
            {formError}
          </p>
        )}

        <div class="flex flex-col gap-1">
          <label for="su-name" class={label}>
            Nombre completo
          </label>
          <input
            id="su-name"
            class={field}
            type="text"
            autoComplete="name"
            value={name}
            onInput={(e) => setName(e.currentTarget.value)}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={describedBy('name')}
          />
          {errors.name && (
            <p id="su-name-error" class={fieldError}>
              {errors.name}
            </p>
          )}
        </div>

        <div class="flex flex-col gap-1">
          <label for="su-phone" class={label}>
            Celular
          </label>
          <input
            id="su-phone"
            class={field}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={9}
            value={phone}
            onInput={(e) => setPhone(digitsOnly(e.currentTarget.value))}
            aria-invalid={errors.phone ? 'true' : undefined}
            aria-describedby={describedBy('phone', 'su-phone-hint')}
          />
          <p id="su-phone-hint" class={hint}>
            9 dígitos. Lo usamos para contactarte por tu reserva.
          </p>
          {errors.phone && (
            <p id="su-phone-error" class={fieldError}>
              {errors.phone}
            </p>
          )}
        </div>

        <div class="flex flex-col gap-1">
          <label for="su-email" class={label}>
            Correo
          </label>
          <input
            id="su-email"
            class={field}
            type="email"
            autoComplete="email"
            value={email}
            onInput={(e) => setEmail(e.currentTarget.value)}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={describedBy('email')}
          />
          {errors.email && (
            <p id="su-email-error" class={fieldError}>
              {errors.email}
            </p>
          )}
        </div>

        <div class="flex flex-col gap-1">
          <label for="su-password" class={label}>
            Contraseña
          </label>
          <input
            id="su-password"
            class={field}
            type="password"
            autoComplete="new-password"
            value={password}
            onInput={(e) => setPassword(e.currentTarget.value)}
            aria-invalid={errors.password ? 'true' : undefined}
            aria-describedby={describedBy('password', 'su-password-hint')}
          />
          <p id="su-password-hint" class={hint}>
            Mínimo {PASSWORD_MIN_LENGTH} caracteres.
          </p>
          {errors.password && (
            <p id="su-password-error" class={fieldError}>
              {errors.password}
            </p>
          )}
        </div>

        <button type="submit" class={primaryBtn} disabled={busy}>
          {busy ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
}

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
import GoogleIcon from './GoogleIcon';

type Errors = Partial<Record<'name' | 'phone' | 'email' | 'password', string>>;

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

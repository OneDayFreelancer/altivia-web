import { useEffect, useState } from 'preact/hooks';
import { currentNext, digitsOnly, requireSession, validatePhone } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { alertBox, field, fieldError, hint, label, primaryBtn } from './formStyles';

/** Pide el celular tras el login con Google. Obligatorio. */
export default function CompleteProfileForm() {
  const [userId, setUserId] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    requireSession().then(async (session) => {
      const user = session?.user;
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .maybeSingle();
      if (profile?.phone) {
        window.location.replace(currentNext());
        return;
      }
      setUserId(user.id);
    });
  }, []);

  const submit = async (e: Event) => {
    e.preventDefault();
    if (busy || !userId) return;
    const err = validatePhone(phone);
    setError(err ?? '');
    setFormError('');
    if (err) {
      document.getElementById('cp-phone')?.focus();
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ phone })
      .eq('id', userId);
    if (updateError) {
      setBusy(false);
      setFormError('No pudimos guardar tu celular. Inténtalo de nuevo.');
      return;
    }
    window.location.replace(currentNext());
  };

  if (!userId) {
    return (
      <p role="status" class="text-body text-text-muted">
        Cargando…
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
        <label for="cp-phone" class={label}>
          Celular
        </label>
        <input
          id="cp-phone"
          class={field}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={9}
          value={phone}
          onInput={(e) => setPhone(digitsOnly(e.currentTarget.value))}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'cp-phone-hint cp-phone-error' : 'cp-phone-hint'}
        />
        <p id="cp-phone-hint" class={hint}>
          9 dígitos. Lo usamos para contactarte por tu reserva.
        </p>
        {error && (
          <p id="cp-phone-error" class={fieldError}>
            {error}
          </p>
        )}
      </div>
      <button type="submit" class={primaryBtn} disabled={busy}>
        {busy ? 'Guardando…' : 'Guardar y continuar'}
      </button>
    </form>
  );
}

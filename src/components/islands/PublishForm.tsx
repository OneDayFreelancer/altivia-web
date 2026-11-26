import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { digitsOnly, validatePhone } from '@/lib/auth';
import {
  createListing,
  LISTING_AMENITIES,
  MAX_PHOTOS,
  PHOTO_EXTENSIONS,
  PROPERTY_TYPES,
  validatePhotos,
} from '@/lib/listings';
import { supabase } from '@/lib/supabase';
import { alertBox, field, fieldError, hint, label, outlineBtn, primaryBtn } from './formStyles';

const EMPTY = {
  title: '',
  propertyType: '',
  district: '',
  address: '',
  maxCapacity: '',
  pricePerTurn: '',
  description: '',
  contactPhone: '',
};

type Values = typeof EMPTY;
type Errors = Partial<Record<keyof Values | 'photos', string>>;

const between = (v: string, min: number, max: number) =>
  v.trim().length >= min && v.trim().length <= max;

function validate(v: Values, photos: File[]): Errors {
  const capacity = Number(v.maxCapacity);
  const errors: Errors = {
    title: between(v.title, 5, 80) ? undefined : 'Entre 5 y 80 caracteres.',
    propertyType: v.propertyType ? undefined : 'Elige el tipo de espacio.',
    district: between(v.district, 2, 60) ? undefined : 'Indica el distrito.',
    address: between(v.address, 5, 160) ? undefined : 'Indica la dirección.',
    maxCapacity:
      Number.isInteger(capacity) && capacity >= 1 && capacity <= 1000
        ? undefined
        : 'Número entre 1 y 1000.',
    pricePerTurn: Number(v.pricePerTurn) > 0 ? undefined : 'Indica un precio mayor a 0.',
    description: between(v.description, 30, 1500) ? undefined : 'Entre 30 y 1500 caracteres.',
    contactPhone: validatePhone(v.contactPhone),
    photos: validatePhotos(photos),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
}

function Field({
  name,
  text,
  error,
  help,
  children,
}: {
  name: string;
  text: string;
  error?: string;
  help?: string;
  children: ComponentChildren;
}) {
  return (
    <div class="flex flex-col gap-1">
      <label for={`pub-${name}`} class={label}>
        {text}
      </label>
      {children}
      {help && <p class={hint}>{help}</p>}
      {error && (
        <p id={`pub-${name}-error`} class={fieldError}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Formulario para que un propietario registre su terraza. Requiere sesión. */
export default function PublishForm() {
  // `undefined` = sesión sin resolver; `null` = sin sesión.
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [values, setValues] = useState<Values>(EMPTY);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    // Sin redirección: la información de la página se puede leer sin cuenta.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setUserId(null);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', session.user.id)
        .maybeSingle();
      if (data?.phone) setValues((v) => ({ ...v, contactPhone: data.phone }));
      setUserId(session.user.id);
    });
  }, []);

  const set = (key: keyof Values) => (e: Event) => {
    const { value } = e.currentTarget as HTMLInputElement;
    setValues((v) => ({ ...v, [key]: key === 'contactPhone' ? digitsOnly(value) : value }));
  };

  const control = (key: keyof Values) => ({
    id: `pub-${key}`,
    class: field,
    value: values[key],
    onInput: set(key),
    'aria-invalid': errors[key] ? ('true' as const) : undefined,
    'aria-describedby': errors[key] ? `pub-${key}-error` : undefined,
  });

  const submit = async (e: Event) => {
    e.preventDefault();
    if (busy || !userId) return;
    const found = validate(values, photos);
    setErrors(found);
    setFormError('');
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`pub-${first}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      await createListing(
        {
          title: values.title.trim(),
          propertyType: values.propertyType,
          district: values.district.trim(),
          address: values.address.trim(),
          maxCapacity: Number(values.maxCapacity),
          pricePerTurn: Number(values.pricePerTurn),
          description: values.description.trim(),
          amenities,
          contactPhone: values.contactPhone,
        },
        photos,
        userId,
      );
      setSent(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setFormError('No pudimos enviar tu solicitud. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  if (userId === null) {
    return (
      <a href="/login?next=%2Fpublicar" class={primaryBtn}>
        Inicia sesión para registrar tu espacio
      </a>
    );
  }

  if (userId === undefined) {
    return (
      <p role="status" class="text-body text-text-muted">
        Cargando…
      </p>
    );
  }

  if (sent) {
    return (
      <div role="status" class="flex flex-col gap-4 rounded-card border border-border p-5">
        <p class="text-body font-semibold">¡Recibimos tu solicitud!</p>
        <p class="text-body text-text-muted">
          Revisaremos los datos y te contactaremos al {values.contactPhone}.
        </p>
        <a href="/" class={outlineBtn}>
          Volver al inicio
        </a>
      </div>
    );
  }

  return (
    <form class="flex flex-col gap-5" onSubmit={submit} noValidate>
      <Field name="title" text="Nombre del espacio" error={errors.title}>
        <input {...control('title')} type="text" maxLength={80} placeholder="Terraza Los Olivos" />
      </Field>
      <Field name="propertyType" text="Tipo de espacio" error={errors.propertyType}>
        <select {...control('propertyType')}>
          <option value="">Elige un tipo</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>
      <div class="grid gap-5 sm:grid-cols-2">
        <Field name="district" text="Distrito" error={errors.district}>
          <input {...control('district')} type="text" maxLength={60} />
        </Field>
        <Field
          name="address"
          text="Dirección"
          error={errors.address}
          help="No se publica sin tu permiso."
        >
          <input
            {...control('address')}
            type="text"
            maxLength={160}
            autoComplete="street-address"
          />
        </Field>
        <Field name="maxCapacity" text="Capacidad máxima (personas)" error={errors.maxCapacity}>
          <input {...control('maxCapacity')} type="number" inputMode="numeric" min={1} max={1000} />
        </Field>
        <Field name="pricePerTurn" text="Precio por turno (S/)" error={errors.pricePerTurn}>
          <input {...control('pricePerTurn')} type="number" inputMode="decimal" min={1} />
        </Field>
      </div>
      <Field
        name="description"
        text="Descripción"
        error={errors.description}
        help="Ambiente, horarios disponibles y reglas de uso."
      >
        <textarea {...control('description')} rows={5} maxLength={1500} />
      </Field>

      <fieldset class="flex flex-col gap-2">
        <legend class={`${label} mb-2`}>Características</legend>
        <div class="grid gap-2 sm:grid-cols-2">
          {LISTING_AMENITIES.map((a) => (
            <label key={a} class="flex items-center gap-2 text-body">
              <input
                type="checkbox"
                class="size-4 accent-dark"
                checked={amenities.includes(a)}
                onChange={(e) => {
                  const { checked } = e.currentTarget;
                  setAmenities((list) => (checked ? [...list, a] : list.filter((x) => x !== a)));
                }}
              />
              {a}
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        name="photos"
        text="Fotos"
        error={errors.photos}
        help={`Hasta ${MAX_PHOTOS} fotos JPG, PNG o WebP de máximo 5 MB. La primera será la portada.`}
      >
        <input
          id="pub-photos"
          class={field}
          type="file"
          multiple
          accept={Object.keys(PHOTO_EXTENSIONS).join(',')}
          aria-invalid={errors.photos ? 'true' : undefined}
          onChange={(e) => setPhotos(Array.from(e.currentTarget.files ?? []))}
        />
        {photos.length > 0 && (
          <ul class={hint}>
            {photos.map((f) => (
              <li key={f.name}>{f.name}</li>
            ))}
          </ul>
        )}
      </Field>

      <Field
        name="contactPhone"
        text="Celular de contacto"
        error={errors.contactPhone}
        help="9 dígitos."
      >
        <input {...control('contactPhone')} type="tel" inputMode="numeric" maxLength={9} />
      </Field>

      {formError && (
        <p role="alert" class={alertBox}>
          {formError}
        </p>
      )}
      <button type="submit" class={primaryBtn} disabled={busy}>
        {busy ? 'Enviando…' : 'Enviar solicitud'}
      </button>
    </form>
  );
}

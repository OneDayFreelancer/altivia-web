import type { User } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'preact/hooks';
import { supabase } from '@/lib/supabase';

interface Props {
  loginLabel: string;
  loginHref: string;
  signUpLabel: string;
  signUpHref: string;
  /** En el menú móvil: registro con borde y cierre de sesión en línea. */
  mobile?: boolean;
}

const linkBase = 'rounded-pill px-4 py-2 text-small font-semibold transition-colors';

const displayName = (user: User): string => {
  const meta = user.user_metadata as { name?: string; full_name?: string };
  return meta.name || meta.full_name || user.email?.split('@')[0] || 'Mi cuenta';
};

/** Acciones de cuenta del header: Log in / Sign Up, o el usuario si hay sesión. */
export default function AuthNav({ loginLabel, loginHref, signUpLabel, signUpHref, mobile }: Props) {
  // `undefined` = aún sin resolver la sesión (evita parpadeo de Log in / Sign Up).
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const logout = async () => {
    if (busy) return;
    setBusy(true);
    await supabase.auth.signOut();
    window.location.replace('/');
  };

  if (user === undefined) return <div class="h-10 w-40" aria-hidden="true" />;

  if (user) {
    const name = displayName(user);
    const avatar = (
      <span
        aria-hidden="true"
        class="inline-flex size-9 items-center justify-center rounded-pill bg-primary text-primary-contrast"
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
    const logoutClass = `${linkBase} text-left text-white hover:bg-white/15 disabled:opacity-50`;

    if (mobile) {
      return (
        <div class="flex items-center gap-3 text-small font-semibold text-white">
          {avatar}
          <span class="max-w-32 truncate">{name}</span>
          <a href="/mis-reservas" class={logoutClass}>
            Mis reservas
          </a>
          <button type="button" class={logoutClass} onClick={logout} disabled={busy}>
            Cerrar sesión
          </button>
        </div>
      );
    }

    return (
      <div ref={root} class="relative">
        <button
          ref={toggle}
          type="button"
          class="flex items-center gap-2 rounded-pill py-1 pl-1 pr-3 text-small font-semibold text-white transition-colors hover:bg-white/15"
          aria-expanded={open}
          aria-controls="user-menu"
          aria-label={`Cuenta de ${name}`}
          onClick={() => setOpen(!open)}
        >
          {avatar}
          <span class="max-w-40 truncate">{name}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open && (
          <div
            id="user-menu"
            class="absolute right-0 top-full mt-2 min-w-44 rounded-card border border-white/10 bg-dark p-1 shadow-soft"
          >
            <a href="/mis-reservas" class={`${logoutClass} block w-full`}>
              Mis reservas
            </a>
            <button type="button" class={`${logoutClass} w-full`} onClick={logout} disabled={busy}>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <a href={loginHref} class={`${linkBase} text-white hover:bg-white/15`}>
        {loginLabel}
      </a>
      <a
        href={signUpHref}
        class={`inline-flex items-center justify-center rounded-pill bg-dark px-5 py-2.5 text-small font-semibold text-dark-contrast transition-colors hover:bg-dark-hover ${mobile ? 'border border-white/30' : ''}`}
      >
        {signUpLabel}
      </a>
    </>
  );
}

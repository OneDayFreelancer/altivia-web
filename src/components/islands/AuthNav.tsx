import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'preact/hooks';
import { supabase } from '@/lib/supabase';

interface Props {
  loginLabel: string;
  loginHref: string;
  signUpLabel: string;
  signUpHref: string;
  /** En el menú móvil el botón de registro lleva borde. */
  bordered?: boolean;
}

const linkBase = 'rounded-pill px-4 py-2 text-small font-semibold transition-colors';

const displayName = (user: User): string => {
  const meta = user.user_metadata as { name?: string; full_name?: string };
  return meta.name || meta.full_name || user.email?.split('@')[0] || 'Mi cuenta';
};

/** Acciones de cuenta del header: Log in / Sign Up, o el usuario si hay sesión. */
export default function AuthNav({
  loginLabel,
  loginHref,
  signUpLabel,
  signUpHref,
  bordered,
}: Props) {
  // `undefined` = aún sin resolver la sesión (evita parpadeo de Log in / Sign Up).
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  if (user === undefined) return <div class="h-10 w-40" aria-hidden="true" />;

  if (user) {
    const name = displayName(user);
    return (
      <div class="flex items-center gap-2 text-small font-semibold text-white">
        <span
          aria-hidden="true"
          class="inline-flex size-9 items-center justify-center rounded-pill bg-primary text-primary-contrast"
        >
          {name.charAt(0).toUpperCase()}
        </span>
        <span class="max-w-40 truncate">{name}</span>
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
        class={`inline-flex items-center justify-center rounded-pill bg-dark px-5 py-2.5 text-small font-semibold text-dark-contrast transition-colors hover:bg-dark-hover ${bordered ? 'border border-white/30' : ''}`}
      >
        {signUpLabel}
      </a>
    </>
  );
}

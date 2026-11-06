import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type Role = 'super_admin' | 'admin' | 'viewer';
interface Ctx { session: Session | null; role: Role | null; loading: boolean; isAdmin: boolean;
  signIn: (e: string, p: string) => Promise<string | null>; signOut: () => Promise<void>; }
const C = createContext<Ctx>(null as unknown as Ctx);
export const useAuth = () => useContext(C);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setRole(null); setLoading(false); return; }
    supabase.from('admin_profiles').select('role,is_active').eq('id', session.user.id).maybeSingle()
      .then(({ data }) => { setRole(data?.is_active ? (data.role as Role) : null); setLoading(false); });
  }, [session]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };
  const signOut = async () => { await supabase.auth.signOut(); };
  return <C.Provider value={{ session, role, loading, isAdmin: role === 'admin' || role === 'super_admin', signIn, signOut }}>{children}</C.Provider>;
}

import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function Login() {
  const { signIn, role, session } = useAuth();
  const [email, setEmail] = useState(''); const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  if (session && role) return <Navigate to="/portal" replace />;
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(null);
    setErr(await signIn(email.trim(), pw)); setBusy(false);
  };
  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-br from-[#0B1F4B] to-[#5B2C83] p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" aria-labelledby="t">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#D4AF37]"><Lock className="h-6 w-6 text-[#0B1F4B]" /></div>
        <h1 id="t" className="text-center text-xl font-bold text-[#0B1F4B]">Cross River Arise 2027</h1>
        <p className="mb-5 text-center text-sm text-gray-500">Administrator sign in</p>
        <label className="block text-sm font-medium" htmlFor="em">Email</label>
        <input id="em" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
          className="mb-3 mt-1 w-full rounded-lg border p-2.5 focus:outline-none focus:ring-2 focus:ring-[#4FB3E8]" />
        <label className="block text-sm font-medium" htmlFor="pw">Password</label>
        <input id="pw" type="password" required minLength={8} autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)}
          className="mb-3 mt-1 w-full rounded-lg border p-2.5 focus:outline-none focus:ring-2 focus:ring-[#4FB3E8]" />
        {err && <p role="alert" className="mb-3 text-sm text-red-600">{err}</p>}
        {session && !role && <p role="alert" className="mb-3 text-sm text-red-600">This account has no active portal access.</p>}
        <button disabled={busy} className="w-full rounded-lg bg-[#5B2C83] p-2.5 font-semibold text-white hover:bg-[#4a2269] disabled:opacity-60">
          {busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  );
}

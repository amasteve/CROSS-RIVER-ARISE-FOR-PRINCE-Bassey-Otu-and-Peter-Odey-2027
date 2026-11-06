import { useEffect, useMemo, useState } from 'react';
import { Users, UserCheck, MapPin, ClipboardList, AlertTriangle, Search, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Exec { id: string; level: 'chapter' | 'ward'; position: string; full_name: string; ward_name: string | null; phone: string | null; is_active: boolean; needs_verification: boolean; verification_note: string | null; }
interface Coord { id: string; full_name: string; phone: string; polling_unit_id: string | null; is_active: boolean; needs_verification: boolean; verification_note: string | null; }
interface PU { id: string; name: string; code: string; is_active: boolean; needs_verification: boolean; verification_note: string | null; }

function Card({ icon: I, label, value, sub, tone }: { icon: typeof Users; label: string; value: number | string; sub?: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`mb-2 grid h-9 w-9 place-items-center rounded-lg text-white ${tone}`}><I className="h-5 w-5" /></div>
      <div className="text-2xl font-bold text-[#0B1F4B]">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin, role, signOut } = useAuth();
  const [ex, setEx] = useState<Exec[]>([]); const [co, setCo] = useState<Coord[]>([]); const [pu, setPu] = useState<PU[]>([]);
  const [err, setErr] = useState<string | null>(null); const [q, setQ] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('ward_executives').select('*'),
      supabase.from('polling_unit_coordinators').select('*'),
      supabase.from('polling_units').select('*'),
    ]).then(([a, b, c]) => {
      const e = a.error || b.error || c.error; if (e) return setErr(e.message);
      setEx(a.data as Exec[]); setCo(b.data as Coord[]); setPu(c.data as PU[]);
    });
  }, []);

  const s = useMemo(() => {
    const chapter = ex.filter(x => x.level === 'chapter' && x.is_active).length;
    const ward = ex.filter(x => x.level === 'ward' && x.is_active).length;
    const coords = co.filter(x => x.is_active).length;
    const assigned = co.filter(x => x.is_active && x.polling_unit_id).length;
    const uniqueCodes = new Set(pu.map(x => x.code)).size;
    const flags = [
      ...ex.filter(x => x.is_active && x.needs_verification).map(x => ({ k: x.id, who: x.full_name, where: `${x.level} · ${x.position}`, note: x.verification_note })),
      ...co.filter(x => x.is_active && x.needs_verification).map(x => ({ k: x.id, who: x.full_name, where: 'PU coordinator', note: x.verification_note })),
      ...pu.filter(x => x.needs_verification).map(x => ({ k: x.id, who: `${x.name} (${x.code})`, where: 'Polling unit', note: x.verification_note })),
    ];
    return { chapter, ward, coords, total: chapter + ward + coords, assigned, uniqueCodes, flags };
  }, [ex, co, pu]);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    const all = ex.filter(x => x.is_active).map(x => ({ k: x.id, name: x.full_name, role: `${x.level === 'chapter' ? 'Chapter' : 'Ward'} · ${x.position}`, area: x.ward_name ?? '', phone: x.phone }));
    return all.filter(r => !t || `${r.name} ${r.role} ${r.area} ${isAdmin ? r.phone ?? '' : ''}`.toLowerCase().includes(t));
  }, [ex, q, isAdmin]);

  const max = Math.max(s.chapter, s.ward, s.coords, 1);
  const bars = [['Chapter excos', s.chapter, 'bg-[#5B2C83]'], ['Ward executives', s.ward, 'bg-[#4FB3E8]'], ['PU coordinators', s.coords, 'bg-[#D4AF37]']] as const;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between bg-[#0B1F4B] px-4 py-3 text-white">
        <div><div className="font-bold">Cross River Arise 2027</div><div className="text-xs text-[#D4AF37]">Leadership &amp; Polling Unit Portal · {role}</div></div>
        <button onClick={signOut} className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20" aria-label="Sign out"><LogOut className="h-4 w-4" />Sign out</button>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 p-4">
        {err && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}
        <section aria-label="Summary" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Card icon={Users} label="Chapter Executive Officers" value={s.chapter} tone="bg-[#5B2C83]" />
          <Card icon={UserCheck} label="Ward Executive Officers" value={s.ward} tone="bg-[#4FB3E8]" />
          <Card icon={ClipboardList} label="PU Coordinator Records" value={s.coords} tone="bg-[#D4AF37]" />
          <Card icon={Users} label="Total Leadership Records" value={s.total} tone="bg-[#0B1F4B]" />
          <Card icon={MapPin} label="Listed PU Assignments" value={s.assigned} sub={`${s.uniqueCodes} unique codes listed`} tone="bg-[#5B2C83]" />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <h2 className="mb-3 font-semibold text-[#0B1F4B]">Records by group</h2>
            {bars.map(([l, v, c]) => (
              <div key={l} className="mb-2"><div className="flex justify-between text-sm"><span>{l}</span><span>{v}</span></div>
                <div className="h-2.5 rounded-full bg-gray-100"><div className={`h-2.5 rounded-full transition-all duration-700 ${c}`} style={{ width: `${(v / max) * 100}%` }} /></div></div>
            ))}
          </div>
          <div className="rounded-2xl border-l-4 border-[#D4AF37] bg-white p-4 shadow-sm ring-1 ring-black/5">
            <h2 className="mb-1 font-semibold text-[#0B1F4B]">Listed assignments ≠ verified coverage</h2>
            <p className="text-sm text-gray-600"><b>{s.assigned}</b> polling units are listed with a coordinator. Total polling units in the ward has <b>not been verified</b>, so coverage can't be stated. Code 016 is absent from the list and code 006 appears twice.</p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-amber-300">
          <h2 className="mb-2 flex items-center gap-2 font-semibold text-[#0B1F4B]"><AlertTriangle className="h-5 w-5 text-amber-500" />Needs administrator verification ({s.flags.length})</h2>
          <ul className="divide-y text-sm">{s.flags.map(f => (
            <li key={f.k} className="py-2"><b>{f.who}</b> <span className="text-gray-400">· {f.where}</span><div className="text-gray-600">{f.note}</div></li>))}</ul>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="mb-3 flex items-center gap-2 rounded-lg border px-3"><Search className="h-4 w-4 text-gray-400" />
            <input aria-label="Search leadership" value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, position or ward"
              className="w-full py-2 text-sm outline-none" /></div>
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-500"><tr><th className="py-2">Name</th><th>Position</th><th>Ward</th>{isAdmin && <th>Phone</th>}</tr></thead>
            <tbody>{rows.map(r => (<tr key={r.k} className="border-t"><td className="py-2 font-medium">{r.name}</td><td>{r.role}</td><td>{r.area}</td>{isAdmin && <td>{r.phone}</td>}</tr>))}</tbody>
          </table></div>
        </section>
      </main>
    </div>
  );
}

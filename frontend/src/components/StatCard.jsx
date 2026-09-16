export default function StatCard({ title, value, description, icon: Icon, color = 'blue' }) {
  const colors = { blue: 'bg-blue-50 text-blue-600', violet: 'bg-violet-50 text-violet-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600' };
  return <div className="panel flex items-start justify-between p-5"><div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-400">{description}</p></div><div className={`rounded-xl p-3 ${colors[color] || colors.blue}`}><Icon size={21} /></div></div>;
}

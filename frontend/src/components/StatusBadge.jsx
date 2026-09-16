const colors = {
  NEW: 'bg-blue-500/15 text-blue-300',
  QUOTED: 'bg-violet-500/15 text-violet-300',
  WON: 'bg-emerald-500/15 text-emerald-300',
  LOST: 'bg-red-500/15 text-red-300',
  DRAFT: 'bg-slate-700 text-slate-300',
  SENT: 'bg-indigo-500/15 text-indigo-300',
  ACCEPTED: 'bg-emerald-500/15 text-emerald-300',
  REJECTED: 'bg-red-500/15 text-red-300',
  PENDING: 'bg-amber-500/15 text-amber-300',
  CONFIRMED: 'bg-blue-500/15 text-blue-300',
  DISPATCHED: 'bg-emerald-500/15 text-emerald-300',
  CANCELLED: 'bg-red-500/15 text-red-300',
  AVAILABLE: 'bg-emerald-500/15 text-emerald-300',
  LOW: 'bg-amber-500/15 text-amber-300',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${colors[status] || 'bg-slate-100 text-slate-800'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

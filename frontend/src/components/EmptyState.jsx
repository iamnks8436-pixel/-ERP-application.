import { Inbox } from 'lucide-react';
export default function EmptyState({ title = 'Nothing here yet', description = 'New records will appear here once they are created.' }) {
  return <div className="flex flex-col items-center justify-center px-6 py-16 text-center"><div className="rounded-2xl bg-slate-100 p-4 text-slate-400"><Inbox size={28} /></div><p className="mt-4 font-semibold text-slate-700">{title}</p><p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p></div>;
}

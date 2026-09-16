import { Bell, Menu, Search, LogOut } from 'lucide-react';

export default function Header({ user, onMenu, onLogout }) {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3"><button className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 lg:hidden" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button><div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-500 sm:flex"><Search size={16} />Search workspace</div></div>
      <div className="flex items-center gap-3"><button className="relative rounded-xl p-2.5 text-slate-400 hover:bg-slate-800" aria-label="Notifications"><Bell size={19} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-500" /></button><div className="hidden h-8 w-px bg-slate-800 sm:block" /><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600/20 text-sm font-bold text-brand-400">{user?.name?.charAt(0) || 'U'}</div><div className="hidden sm:block"><p className="text-sm font-semibold text-slate-200">{user?.name}</p><p className="text-[11px] text-slate-500">{user?.role}</p></div></div><button onClick={onLogout} className="rounded-xl p-2.5 text-slate-400 hover:bg-red-950/50 hover:text-red-400" title="Logout" aria-label="Logout"><LogOut size={18} /></button></div>
    </header>
  );
}

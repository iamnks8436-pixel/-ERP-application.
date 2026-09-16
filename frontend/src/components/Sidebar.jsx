import { NavLink } from 'react-router-dom';
import {
  Boxes, ChevronLeft, ClipboardList, FileText, Gauge, PackageCheck,
  Settings, ShoppingCart, Truck, Users, X,
} from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: Gauge, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/enquiries', label: 'Enquiries', icon: ClipboardList },
  { to: '/quotations', label: 'Quotations', icon: FileText },
  { to: '/sales-orders', label: 'Sales Orders', icon: ShoppingCart },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/dispatch', label: 'Dispatch', icon: Truck },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, collapsed, onClose, onToggle }) {
  return (
    <>
      {open && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar text-slate-300 transition-all duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'w-20' : 'w-72'}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-900/30"><PackageCheck size={21} /></div>
            {!collapsed && <div><p className="whitespace-nowrap text-sm font-bold text-white">Manufacturing ERP</p><p className="text-[11px] text-slate-400">Operations workspace</p></div>}
          </div>
          <button className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:block" onClick={onToggle} aria-label="Toggle sidebar"><ChevronLeft size={18} className={collapsed ? 'rotate-180' : ''} /></button>
          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" onClick={onClose} aria-label="Close sidebar"><X size={18} /></button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-6">
          {!collapsed && <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Workspace</p>}
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose} title={collapsed ? label : undefined} className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-brand-600 text-white shadow-lg shadow-brand-950/20' : 'text-slate-400 hover:bg-white/10 hover:text-white'} ${collapsed ? 'justify-center' : ''}`}>
              <Icon size={19} className="shrink-0" /><span className={collapsed ? 'sr-only' : ''}>{label}</span>
            </NavLink>
          ))}
        </nav>
        {!collapsed && <div className="mx-4 mb-5 rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-semibold text-white">Need help?</p><p className="mt-1 text-[11px] leading-4 text-slate-400">Review your production pipeline and inventory health.</p></div>}
      </aside>
    </>
  );
}

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <Sidebar open={mobileOpen} collapsed={collapsed} onClose={() => setMobileOpen(false)} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`transition-[padding] duration-200 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <Header user={user} onMenu={() => setMobileOpen(true)} onLogout={logout} />
        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><Outlet /></main>
      </div>
      <Toaster position="top-right" toastOptions={{ duration: 3500, style: { borderRadius: '12px', fontSize: '13px' } }} />
    </div>
  );
}

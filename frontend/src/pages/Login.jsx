import { useState } from 'react';
import { ArrowRight, Boxes, ClipboardList, FileText, LockKeyhole, Mail, PackageCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('sales@erp.com');
  const [password, setPassword] = useState('Sales@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative hidden overflow-hidden bg-sidebar p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="relative"><div className="flex items-center gap-3"><div className="rounded-xl bg-brand-600 p-3"><PackageCheck size={22} /></div><span className="text-lg font-bold">Manufacturing ERP</span></div><div className="mt-24 max-w-lg"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">Operations, connected</p><h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight">Run your entire order lifecycle with confidence.</h1><p className="mt-6 max-w-md text-base leading-7 text-slate-400">Bring enquiries, quotations, inventory, and dispatch into one reliable workspace for your team.</p><div className="mt-10 grid grid-cols-2 gap-4 text-sm text-slate-300"><span className="flex items-center gap-2"><ClipboardList size={16} className="text-brand-400" /> Customer enquiries</span><span className="flex items-center gap-2"><FileText size={16} className="text-brand-400" /> Smart quotations</span><span className="flex items-center gap-2"><Boxes size={16} className="text-brand-400" /> Inventory control</span></div></div></div>
        <p className="relative text-xs text-slate-500">Secure enterprise workspace • v1.0</p>
      </div>
      <div className="flex items-center justify-center bg-slate-50 px-5 py-10 sm:px-10">
      <div className="w-full max-w-md">
        <div className="mb-8 lg:hidden"><div className="flex items-center gap-3 text-brand-700"><div className="rounded-xl bg-brand-600 p-3 text-white"><PackageCheck size={21} /></div><span className="text-lg font-bold">Manufacturing ERP</span></div></div>
        <div className="panel p-8 sm:p-10">
        <div className="mb-8"><h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1><p className="mt-2 text-sm text-slate-500">Sign in to continue to your workspace.</p></div>

        <Alert message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative"><Mail size={17} className="absolute left-3 top-3 text-slate-400" /><input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-10"
              required
            /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative"><LockKeyhole size={17} className="absolute left-3 top-3 text-slate-400" /><input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10"
              required
            /></div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? 'Signing in...' : <>Sign in <ArrowRight size={17} /></>}
          </button>
        </form></div><div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
          <p className="font-medium mb-1">Demo credentials:</p>
          <p>Admin: admin@erp.com / Admin@123</p>
          <p>Sales: sales@erp.com / Sales@123</p>
        </div></div>
      </div>
    </div>
  );
}

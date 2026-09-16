import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, ClipboardList, FileText, PackageCheck, ShoppingCart, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

const chartColors = ['#2563eb', '#8b5cf6', '#10b981', '#ef4444'];
const countStatuses = (items, statuses) => statuses.map((status) => ({ name: status, value: items.filter((item) => item.status === status).length }));

export default function Dashboard() {
  const [data, setData] = useState({ enquiries: [], quotations: [], orders: [], inventory: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([api.get('/customers'), api.get('/enquiries'), api.get('/quotations'), api.get('/sales-orders'), api.get('/sales-orders/inventory')])
      .then(([customers, enquiries, quotations, orders, inventory]) => setData({ customers: customers.data.data, enquiries: enquiries.data.data, quotations: quotations.data.data, orders: orders.data.data, inventory: inventory.data.data }))
      .finally(() => setLoading(false));
  }, []);
  const enquiryChart = useMemo(() => countStatuses(data.enquiries, ['NEW', 'QUOTED', 'WON', 'LOST']), [data.enquiries]);
  const orderChart = useMemo(() => countStatuses(data.orders, ['PENDING', 'CONFIRMED', 'DISPATCHED']), [data.orders]);
  const available = data.inventory.reduce((sum, item) => sum + (item.availableQuantity || 0), 0);
  if (loading) return <Loading rows={6} />;
  return <div className="space-y-8">
    <div><p className="text-sm font-medium text-brand-600">Operations overview</p><h1 className="page-title mt-1">Good morning, welcome back</h1><p className="page-subtitle">Monitor your sales pipeline, orders, and inventory from one place.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard title="Total Customers" value={data.customers?.length || 0} description="Customer directory" icon={Users} color="blue" />
      <StatCard title="Total Enquiries" value={data.enquiries.length} description="All customer requests" icon={ClipboardList} color="violet" />
      <StatCard title="Pending Quotations" value={data.quotations.filter((q) => ['DRAFT', 'SENT'].includes(q.status)).length} description="Awaiting decision" icon={FileText} color="amber" />
      <StatCard title="Active Sales Orders" value={data.orders.filter((o) => o.status !== 'CANCELLED').length} description="In order lifecycle" icon={ShoppingCart} color="emerald" />
      <StatCard title="Available Inventory" value={available.toLocaleString()} description="Units ready to allocate" icon={Boxes} color="blue" />
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="panel p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-slate-900">Sales pipeline</h2><p className="text-xs text-slate-400">Enquiries by stage</p></div><BarChart3 size={19} className="text-slate-400" /></div><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={enquiryChart} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3}>{enquiryChart.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}</Pie><Tooltip /><text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-800 text-2xl font-bold">{data.enquiries.length}</text><text x="50%" y="61%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 text-xs">enquiries</text></PieChart></ResponsiveContainer></div><div className="grid grid-cols-4 gap-2">{enquiryChart.map((item, i) => <div key={item.name} className="text-center"><div className="mx-auto mb-1 h-2 w-2 rounded-full" style={{ backgroundColor: chartColors[i] }} /><p className="text-xs text-slate-500">{item.name}</p><p className="font-bold text-slate-800">{item.value}</p></div>)}</div></div>
      <div className="panel p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-slate-900">Order status</h2><p className="text-xs text-slate-400">Current sales order volume</p></div><PackageCheck size={19} className="text-slate-400" /></div><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={orderChart} barSize={38}><CartesianGrid vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} /><Tooltip cursor={{ fill: '#f8fafc' }} /><Bar dataKey="value" radius={[7, 7, 0, 0]} fill="#2563eb" /></BarChart></ResponsiveContainer></div></div>
    </div>
    <div className="panel overflow-hidden"><div className="flex items-center justify-between p-5"><div><h2 className="font-semibold text-slate-900">Inventory overview</h2><p className="text-xs text-slate-400">Stock health across products</p></div><Boxes size={19} className="text-slate-400" /></div>{data.inventory.length ? <div className="table-shell rounded-none border-x-0 border-b-0 shadow-none"><table className="w-full"><thead><tr><th>Product</th><th>Physical</th><th>Reserved</th><th>Available</th><th>Health</th></tr></thead><tbody>{data.inventory.slice(0, 6).map((item) => <tr key={item.id}><td className="font-medium text-slate-800">{item.product.name}<span className="ml-2 text-xs text-slate-400">{item.product.sku}</span></td><td>{item.physicalQuantity}</td><td>{item.reservedQuantity}</td><td className="font-semibold text-emerald-600">{item.availableQuantity}</td><td><StatusBadge status={item.availableQuantity < 10 ? 'LOW' : 'AVAILABLE'} /></td></tr>)}</tbody></table></div> : <EmptyState title="No inventory data" />}</div>
  </div>;
}

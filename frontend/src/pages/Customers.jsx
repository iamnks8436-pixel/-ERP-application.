import { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import api from '../api/axios';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

export default function Customers() {
  const [customers, setCustomers] = useState([]); const [query, setQuery] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/customers').then((res) => setCustomers(res.data.data)).finally(() => setLoading(false)); }, []);
  const filtered = customers.filter((customer) => `${customer.companyName} ${customer.contactPerson} ${customer.email}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-brand-600">Relationships</p><h1 className="page-title mt-1">Customers</h1><p className="page-subtitle">Manage the companies and contacts you sell to.</p></div><div className="relative"><Search size={17} className="absolute left-3 top-3 text-slate-400" /><input className="input-field w-72 pl-9" placeholder="Search customers..." value={query} onChange={(e) => setQuery(e.target.value)} /></div></div><div className="table-shell">{loading ? <div className="p-5"><Loading /></div> : filtered.length ? <div className="overflow-x-auto"><table className="w-full"><thead><tr><th>Company</th><th>Contact</th><th>Email</th><th>Mobile</th><th>City</th></tr></thead><tbody>{filtered.map((customer) => <tr key={customer.id}><td className="font-semibold text-slate-800">{customer.companyName}</td><td>{customer.contactPerson}</td><td>{customer.email}</td><td>{customer.mobile}</td><td>{customer.city}</td></tr>)}</tbody></table></div> : <EmptyState title="No customers found" description="Try another search or create a customer from a new enquiry." />}</div></div>;
}

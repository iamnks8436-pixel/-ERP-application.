import { useEffect, useState } from 'react';
import api from '../api/axios';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';

const emptyCustomer = {
  companyName: '',
  contactPerson: '',
  mobile: '',
  email: '',
  city: '',
};

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [customer, setCustomer] = useState(emptyCustomer);
  const [requiredDate, setRequiredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);

  const fetchData = async () => {
    try {
      const [enqRes, prodRes] = await Promise.all([
        api.get('/enquiries'),
        api.get('/products'),
      ]);
      setEnquiries(enqRes.data.data);
      setProducts(prodRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === 'quantity' ? parseInt(value, 10) || '' : value;
    setItems(updated);
  };

  const addItem = () => setItems([...items, { productId: '', quantity: 1 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/enquiries', {
        customer,
        requiredDate: new Date(requiredDate).toISOString(),
        notes,
        items: items.map((i) => ({ productId: i.productId, quantity: Number(i.quantity) })),
      });
      setSuccess('Enquiry created successfully');
      setShowForm(false);
      setCustomer(emptyCustomer);
      setRequiredDate('');
      setNotes('');
      setItems([{ productId: '', quantity: 1 }]);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create enquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Customer Enquiries</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          {showForm ? 'Cancel' : 'New Enquiry'}
        </button>
      </div>

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create Enquiry</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input placeholder="Company Name *" value={customer.companyName}
              onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
              className="border rounded-lg px-3 py-2" required />
            <input placeholder="Contact Person *" value={customer.contactPerson}
              onChange={(e) => setCustomer({ ...customer, contactPerson: e.target.value })}
              className="border rounded-lg px-3 py-2" required />
            <input placeholder="Mobile *" value={customer.mobile}
              onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
              className="border rounded-lg px-3 py-2" required />
            <input placeholder="Email *" type="email" value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              className="border rounded-lg px-3 py-2" required />
            <input placeholder="City *" value={customer.city}
              onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
              className="border rounded-lg px-3 py-2" required />
            <input type="date" value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)}
              className="border rounded-lg px-3 py-2" required />
          </div>

          <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-4" rows={2} />

          <h3 className="font-medium mb-2">Products</h3>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <select value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2" required>
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku}) - Avail: {p.availableQuantity}</option>
                ))}
              </select>
              <input type="number" min="1" value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                className="w-24 border rounded-lg px-3 py-2" required />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(index)} className="text-red-500 px-2">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addItem} className="text-brand-600 text-sm mb-4">+ Add Product</button>

          <button type="submit" disabled={loading}
            className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Enquiry'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Enquiry #</th>
              <th className="text-left px-4 py-3 font-semibold">Customer</th>
              <th className="text-left px-4 py-3 font-semibold">Date</th>
              <th className="text-left px-4 py-3 font-semibold">Required</th>
              <th className="text-left px-4 py-3 font-semibold">Products</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enq) => (
              <tr key={enq.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{enq.enquiryNumber}</td>
                <td className="px-4 py-3">
                  <div>{enq.customer.companyName}</div>
                  <div className="text-xs text-slate-500">{enq.customer.contactPerson}</div>
                </td>
                <td className="px-4 py-3">{new Date(enq.enquiryDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">{new Date(enq.requiredDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {enq.items.map((i) => (
                    <div key={i.id} className="text-xs">{i.product.name} x {i.quantity}</div>
                  ))}
                </td>
                <td className="px-4 py-3"><StatusBadge status={enq.status} /></td>
              </tr>
            ))}
            {enquiries.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No enquiries yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

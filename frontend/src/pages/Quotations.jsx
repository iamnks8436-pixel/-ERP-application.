import { useEffect, useState } from 'react';
import api from '../api/axios';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

export default function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [enquiryId, setEnquiryId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState([]);

  const fetchData = async () => {
    try {
      const [quoRes, enqRes] = await Promise.all([
        api.get('/quotations'),
        api.get('/enquiries'),
      ]);
      setQuotations(quoRes.data.data);
      setEnquiries(enqRes.data.data.filter((e) => e.status !== 'LOST'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEnquirySelect = (id) => {
    setEnquiryId(id);
    const enquiry = enquiries.find((e) => e.id === id);
    if (enquiry) {
      setItems(enquiry.items.map((i) => ({
        productId: i.productId,
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: '',
        discountPct: 0,
        gstPct: 18,
      })));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = ['quantity', 'unitPrice', 'discountPct', 'gstPct'].includes(field)
      ? parseFloat(value) || 0
      : value;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/quotations', {
        enquiryId,
        validUntil: new Date(validUntil).toISOString(),
        items: items.map(({ productId, quantity, unitPrice, discountPct, gstPct }) => ({
          productId, quantity, unitPrice, discountPct, gstPct,
        })),
      });
      setSuccess('Quotation created successfully');
      setShowForm(false);
      setEnquiryId('');
      setValidUntil('');
      setItems([]);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quotation');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this quotation as ${status.toLowerCase()}?`)) return;
    setError('');
    try {
      await api.patch(`/quotations/${id}/status`, { status });
      setSuccess(`Quotation ${status.toLowerCase()}`);
      toast.success(`Quotation ${status.toLowerCase()} successfully`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const convertToOrder = async (id) => {
    if (!window.confirm('Convert this accepted quotation into a sales order?')) return;
    setError('');
    try {
      await api.post(`/quotations/${id}/convert`);
      setSuccess('Sales order created successfully');
      toast.success('Sales order created successfully');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to convert quotation');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Quotations</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">
          {showForm ? 'Cancel' : 'New Quotation'}
        </button>
      </div>

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create Quotation</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select value={enquiryId} onChange={(e) => handleEnquirySelect(e.target.value)}
              className="border rounded-lg px-3 py-2" required>
              <option value="">Select enquiry</option>
              {enquiries.map((e) => (
                <option key={e.id} value={e.id}>{e.enquiryNumber} - {e.customer.companyName}</option>
              ))}
            </select>
            <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
              className="border rounded-lg px-3 py-2" required />
          </div>

          {items.length > 0 && (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-3 py-2">Product</th>
                    <th className="text-left px-3 py-2">Qty</th>
                    <th className="text-left px-3 py-2">Unit Price</th>
                    <th className="text-left px-3 py-2">Discount %</th>
                    <th className="text-left px-3 py-2">GST %</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2">{item.productName}</td>
                      <td className="px-3 py-2">{item.quantity}</td>
                      <td className="px-3 py-2">
                        <input type="number" min="0" step="0.01" value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-28 border rounded px-2 py-1" required />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min="0" max="100" value={item.discountPct}
                          onChange={(e) => handleItemChange(index, 'discountPct', e.target.value)}
                          className="w-20 border rounded px-2 py-1" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min="0" max="100" value={item.gstPct}
                          onChange={(e) => handleItemChange(index, 'gstPct', e.target.value)}
                          className="w-20 border rounded px-2 py-1" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button type="submit" disabled={loading || !enquiryId}
            className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Quotation'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {quotations.map((quo) => (
          <div key={quo.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-semibold text-lg">{quo.quotationNumber}</h3>
                <p className="text-sm text-slate-500">
                  Enquiry: {quo.enquiry.enquiryNumber} | Customer: {quo.customer.companyName}
                </p>
                <p className="text-sm text-slate-500">
                  Valid until: {new Date(quo.validUntil).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <StatusBadge status={quo.status} />
                <p className="text-lg font-bold mt-1">₹{Number(quo.grandTotal).toLocaleString()}</p>
              </div>
            </div>

            <div className="text-sm mb-3">
              {quo.items.map((i) => (
                <div key={i.id} className="flex justify-between py-1 border-b border-slate-100">
                  <span>{i.product.name} x {i.quantity} @ ₹{Number(i.unitPrice).toLocaleString()}</span>
                  <span>₹{Number(i.finalAmount).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {['DRAFT', 'SENT'].includes(quo.status) && (
                <>
                  {quo.status === 'DRAFT' && (
                    <button onClick={() => updateStatus(quo.id, 'SENT')}
                      className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      Mark as Sent
                    </button>
                  )}
                  <button onClick={() => updateStatus(quo.id, 'ACCEPTED')}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Accept
                  </button>
                  <button onClick={() => updateStatus(quo.id, 'REJECTED')}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Reject
                  </button>
                </>
              )}
              {quo.status === 'ACCEPTED' && !quo.salesOrder && (
                <button onClick={() => convertToOrder(quo.id)}
                  className="px-3 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700">
                  Convert to Sales Order
                </button>
              )}
              {quo.salesOrder && (
                <span className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                  Order: {quo.salesOrder.orderNumber} ({quo.salesOrder.status})
                </span>
              )}
            </div>
          </div>
        ))}
        {quotations.length === 0 && (
          <div className="text-center py-12 text-slate-500">No quotations yet</div>
        )}
      </div>
    </div>
  );
}

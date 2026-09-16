import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

export default function SalesOrders() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dispatchForm, setDispatchForm] = useState(null);

  const fetchData = async () => {
    try {
      const [orderRes, invRes] = await Promise.all([
        api.get('/sales-orders'),
        api.get('/sales-orders/inventory'),
      ]);
      setOrders(orderRes.data.data);
      setInventory(invRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const confirmOrder = async (id) => {
    if (!window.confirm('Confirm this order and reserve inventory?')) return;
    setError('');
    try {
      await api.post(`/sales-orders/${id}/confirm`);
      setSuccess('Order confirmed and inventory reserved');
      toast.success('Order confirmed and inventory reserved');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm order');
    }
  };

  const openDispatchForm = (order) => {
    setDispatchForm({
      orderId: order.id,
      vehicleNumber: '',
      driverName: '',
      items: order.items.map((i) => ({
        productId: i.productId,
        productName: i.product.name,
        maxQty: i.quantity - i.dispatchedQty,
        quantity: i.quantity - i.dispatchedQty,
      })).filter((i) => i.maxQty > 0),
    });
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/sales-orders/${dispatchForm.orderId}/dispatch`, {
        vehicleNumber: dispatchForm.vehicleNumber,
        driverName: dispatchForm.driverName,
        items: dispatchForm.items.map(({ productId, quantity }) => ({ productId, quantity: Number(quantity) })),
      });
      setSuccess('Dispatch completed successfully');
      toast.success('Dispatch completed successfully');
      setDispatchForm(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch order');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Sales Orders</h1>

      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8">
        <h2 className="text-lg font-semibold mb-3">Inventory Availability</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {inventory.map((inv) => (
            <div key={inv.id} className="border rounded-lg p-3 text-sm">
              <p className="font-medium">{inv.product.name}</p>
              <p className="text-slate-500 text-xs">{inv.product.sku}</p>
              <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                <div><span className="text-slate-500">Physical:</span> {inv.physicalQuantity}</div>
                <div><span className="text-slate-500">Reserved:</span> {inv.reservedQuantity}</div>
                <div><span className="text-slate-500">Available:</span> <span className="font-semibold text-green-700">{inv.availableQuantity}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {dispatchForm && (
        <form onSubmit={handleDispatch} className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Dispatch Order</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input placeholder="Vehicle Number *" value={dispatchForm.vehicleNumber}
              onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleNumber: e.target.value })}
              className="border rounded-lg px-3 py-2" required />
            <input placeholder="Driver Name *" value={dispatchForm.driverName}
              onChange={(e) => setDispatchForm({ ...dispatchForm, driverName: e.target.value })}
              className="border rounded-lg px-3 py-2" required />
          </div>
          {dispatchForm.items.map((item, index) => (
            <div key={item.productId} className="flex items-center gap-3 mb-2 text-sm">
              <span className="flex-1">{item.productName}</span>
              <input type="number" min="1" max={item.maxQty} value={item.quantity}
                onChange={(e) => {
                  const updated = [...dispatchForm.items];
                  updated[index].quantity = parseInt(e.target.value, 10) || 0;
                  setDispatchForm({ ...dispatchForm, items: updated });
                }}
                className="w-24 border rounded-lg px-2 py-1" />
              <span className="text-slate-500">/ {item.maxQty}</span>
            </div>
          ))}
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">
              Confirm Dispatch
            </button>
            <button type="button" onClick={() => setDispatchForm(null)}
              className="px-4 py-2 rounded-lg text-sm border hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                <p className="text-sm text-slate-500">
                  Customer: {order.customer.companyName} | Quotation: {order.quotation.quotationNumber}
                </p>
                <p className="text-sm text-slate-500">
                  Order Date: {new Date(order.orderDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <StatusBadge status={order.status} />
                <p className="text-lg font-bold mt-1">₹{Number(order.totalAmount).toLocaleString()}</p>
              </div>
            </div>

            <div className="text-sm mb-3">
              {order.items.map((i) => (
                <div key={i.id} className="flex justify-between py-1 border-b border-slate-100">
                  <span>{i.product.name} x {i.quantity}</span>
                  <span className="text-slate-500">
                    Reserved: {i.reservedQty} | Dispatched: {i.dispatchedQty}
                  </span>
                </div>
              ))}
            </div>

            {order.dispatches?.length > 0 && (
              <div className="text-xs text-slate-500 mb-3">
                Dispatches: {order.dispatches.map((d) => d.dispatchNumber).join(', ')}
              </div>
            )}

            {isAdmin && (
              <div className="flex flex-wrap gap-2">
                {order.status === 'PENDING' && (
                  <button onClick={() => confirmOrder(order.id)}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Confirm Order (Reserve Stock)
                  </button>
                )}
                {(order.status === 'CONFIRMED' || order.status === 'DISPATCHED') &&
                  order.items.some((i) => i.dispatchedQty < i.quantity) && (
                  <button onClick={() => openDispatchForm(order)}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Dispatch
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-12 text-slate-500">No sales orders yet</div>
        )}
      </div>
    </div>
  );
}

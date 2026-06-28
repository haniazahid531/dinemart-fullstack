import { useEffect, useState } from 'react';
import { Bike, MapPin, Phone } from 'lucide-react';
import { apiRequest } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const riderStatuses = ['Picked Up', 'On the Way', 'Delivered'];

const RiderDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    const data = await apiRequest('/orders');
    setOrders(data);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const updateStatus = async (orderId, status) => {
    await apiRequest(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    load();
  };

  return (
    <div className="page dashboard-page">
      <div className="section-header">
        <div>
          <span className="eyebrow">Rider Dashboard</span>
          <h1>Assigned deliveries for {user?.name}</h1>
          <p>Update picked up, on the way and delivered statuses so the customer can track the order.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card"><Bike /><span>Assigned Orders</span><strong>{orders.length}</strong></div>
        <div className="stat-card"><MapPin /><span>On the Way</span><strong>{orders.filter(o => o.status === 'On the Way').length}</strong></div>
        <div className="stat-card"><Phone /><span>Delivered</span><strong>{orders.filter(o => o.status === 'Delivered').length}</strong></div>
      </div>

      <section className="panel">
        <div className="section-title">
          <h2>My Deliveries</h2>
          <p>Customer contact and delivery address are visible here.</p>
        </div>
        <div className="delivery-grid">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-top"><div><h3>{order.orderNumber}</h3><p>{new Date(order.createdAt).toLocaleString()}</p></div><StatusBadge status={order.status} /></div>
              <p><strong>Customer:</strong> {order.customer?.name}</p>
              <p><strong>Phone:</strong> {order.customerPhone}</p>
              <p><strong>Address:</strong> {order.deliveryAddress}</p>
              <div className="order-items">{order.items.map((item, idx) => <span key={idx}>{item.quantity}x {item.name}</span>)}</div>
              <div className="button-row">
                {riderStatuses.map((status) => <button className="ghost-btn dark" key={status} onClick={() => updateStatus(order._id, status)}>{status}</button>)}
              </div>
            </div>
          ))}
          {orders.length === 0 && <p>No deliveries assigned yet. Admin will assign orders to you.</p>}
        </div>
      </section>
    </div>
  );
};

export default RiderDashboard;

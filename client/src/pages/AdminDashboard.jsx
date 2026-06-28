import { useEffect, useState } from 'react';
import { Bike, CalendarClock, Package, Users } from 'lucide-react';
import { apiRequest } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';

const deliveryStatuses = ['Pending', 'Accepted', 'Preparing', 'Packing', 'Assigned to Rider', 'Picked Up', 'On the Way', 'Delivered', 'Cancelled'];
const dineInStatuses = ['Pending', 'Accepted', 'Preparing', 'Ready for Dine-In', 'Served', 'Cancelled'];
const reservationStatuses = ['Pending', 'Confirmed', 'Seated', 'Completed', 'Cancelled'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [riders, setRiders] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    const [statsData, orderData, reservationData, riderData] = await Promise.all([
      apiRequest('/admin/stats'),
      apiRequest('/orders'),
      apiRequest('/reservations'),
      apiRequest('/admin/riders')
    ]);
    setStats(statsData);
    setOrders(orderData);
    setReservations(reservationData);
    setRiders(riderData);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    setError('');
    try {
      await apiRequest(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const assignRider = async (orderId, riderId) => {
    if (!riderId) return;
    setError('');
    try {
      await apiRequest(`/orders/${orderId}/assign-rider`, { method: 'PATCH', body: JSON.stringify({ riderId }) });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateReservationStatus = async (reservationId, status) => {
    setError('');
    try {
      await apiRequest(`/reservations/${reservationId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page dashboard-page">
      <div className="section-header">
        <div>
          <span className="eyebrow">Admin Dashboard</span>
          <h1>Manage delivery, dine-in, riders and table reservations</h1>
          <p>Food orders can be delivery or dine-in. Grocery orders are delivered by rider to the customer address.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {stats && <div className="stats-grid">
        <div className="stat-card"><Users /><span>Customers</span><strong>{stats.customers}</strong></div>
        <div className="stat-card"><Package /><span>Total Orders</span><strong>{stats.orders}</strong></div>
        <div className="stat-card"><Bike /><span>Active Deliveries</span><strong>{stats.activeDeliveries}</strong></div>
        <div className="stat-card"><CalendarClock /><span>Reservations</span><strong>{stats.reservations}</strong></div>
        <div className="stat-card"><Package /><span>Sales</span><strong>Rs. {stats.totalSales}</strong></div>
      </div>}

      <section className="panel">
        <div className="section-title">
          <h2>All Customer Orders</h2>
          <p>Admin can accept, update dine-in waiting flow, and assign riders for delivery orders.</p>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Assign Rider</th><th>Update</th></tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statuses = order.fulfillmentType === 'Dine-In' ? dineInStatuses : deliveryStatuses;
                return (
                <tr key={order._id}>
                  <td>
                    <strong>{order.orderNumber}</strong><br />
                    <small>{new Date(order.createdAt).toLocaleString()}</small><br />
                    <span className="table-item">{order.fulfillmentType} • {order.orderSource}</span>
                    {order.fulfillmentType === 'Dine-In' && <small><br />{order.dineInGuests} guests at {order.dineInTime}</small>}
                  </td>
                  <td>{order.customer?.name}<br /><small>{order.customerPhone}</small>{order.fulfillmentType === 'Delivery' && <small><br />{order.deliveryAddress}</small>}</td>
                  <td>{order.items.map((item, idx) => <span className="table-item" key={idx}>{item.quantity}x {item.name}</span>)}</td>
                  <td>Rs. {order.total}<br /><small>{order.estimatedMinutes} mins est.</small></td>
                  <td><StatusBadge status={order.status} /><br />{order.riderName && <small>{order.riderName} • {order.riderPhone}</small>}</td>
                  <td>
                    {order.fulfillmentType === 'Delivery' ? (
                      <select value={order.rider?._id || ''} onChange={(e) => assignRider(order._id, e.target.value)}>
                        <option value="">Select rider</option>
                        {riders.map((rider) => <option value={rider._id} key={rider._id}>{rider.name}</option>)}
                      </select>
                    ) : <span className="table-item">No rider needed</span>}
                  </td>
                  <td>
                    <select value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)}>
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                </tr>
              );})}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7">No customer orders yet. Place an order from the customer side to test the full workflow.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>Table Reservations</h2>
          <p>Confirm, seat, complete or cancel reservation requests.</p>
        </div>
        <div className="reservation-list">
          {reservations.map((reservation) => (
            <div className="reservation-card admin" key={reservation._id}>
              <div>
                <h3>{reservation.reservationNumber}</h3>
                <p><strong>{reservation.customer?.name}</strong> • {reservation.phone}</p>
                <p>{reservation.restaurant?.name} • {reservation.date} at {reservation.time} • {reservation.guests} guests</p>
                <p>Pre-order total: Rs. {reservation.preorderTotal}</p>
              </div>
              <div>
                <StatusBadge status={reservation.status} />
                <select value={reservation.status} onChange={(e) => updateReservationStatus(reservation._id, e.target.value)}>
                  {reservationStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>
          ))}
          {reservations.length === 0 && <p>No table reservations yet. Customer reservation requests will appear here.</p>}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

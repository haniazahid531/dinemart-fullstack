import { useEffect, useState } from 'react';
import { CalendarPlus, PackageCheck, Phone, Truck, Utensils } from 'lucide-react';
import { apiRequest } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import OrderTimeline from '../components/OrderTimeline.jsx';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [menu, setMenu] = useState([]);
  const [selectedPreorder, setSelectedPreorder] = useState([]);
  const [reservationForm, setReservationForm] = useState({
    restaurant: '',
    guests: 2,
    date: '',
    time: '',
    phone: user?.phone || '',
    specialRequest: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    const [myOrders, myReservations, restaurantList] = await Promise.all([
      apiRequest('/orders/my'),
      apiRequest('/reservations/my'),
      apiRequest('/catalog/restaurants')
    ]);
    setOrders(myOrders);
    setReservations(myReservations);
    setRestaurants(restaurantList);
  };

  useEffect(() => {
    loadDashboard().catch((err) => setError(err.message));
  }, []);

  const loadMenu = async (restaurantId) => {
    setReservationForm((prev) => ({ ...prev, restaurant: restaurantId }));
    setSelectedPreorder([]);
    if (!restaurantId) {
      setMenu([]);
      return;
    }
    const data = await apiRequest(`/catalog/restaurants/${restaurantId}/menu`);
    setMenu(data.items);
  };

  const addPreorder = (item) => {
    setSelectedPreorder((current) => {
      const exists = current.find((pre) => pre.itemId === item._id);
      if (exists) {
        return current.map((pre) => pre.itemId === item._id ? { ...pre, quantity: pre.quantity + 1 } : pre);
      }
      return [...current, { itemId: item._id, name: item.name, price: item.price, quantity: 1, image: item.image }];
    });
  };

  const submitReservation = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiRequest('/reservations', {
        method: 'POST',
        body: JSON.stringify({ ...reservationForm, preorderItems: selectedPreorder })
      });
      setMessage('Reservation request submitted successfully. Admin will confirm it soon.');
      setReservationForm({ restaurant: '', guests: 2, date: '', time: '', phone: user?.phone || '', specialRequest: '' });
      setMenu([]);
      setSelectedPreorder([]);
      loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page dashboard-page">
      <div className="section-header">
        <div>
          <span className="eyebrow">Customer Dashboard</span>
          <h1>Track your orders and manage table reservations</h1>
          <p>Welcome, {user?.name}. Your orders and reservations update when admin or rider changes status.</p>
        </div>
      </div>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card"><PackageCheck /><span>Total Orders</span><strong>{orders.length}</strong></div>
        <div className="stat-card"><CalendarPlus /><span>Reservations</span><strong>{reservations.length}</strong></div>
        <div className="stat-card"><Phone /><span>Active Deliveries</span><strong>{orders.filter(o => ['Assigned to Rider','Picked Up','On the Way'].includes(o.status)).length}</strong></div>
      </div>

      <section className="panel">
        <div className="section-title">
          <h2>My Order Tracking</h2>
          <p>See estimated time, rider contact and status history.</p>
        </div>
        <div className="order-grid">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-top">
                <div><h3>{order.orderNumber}</h3><p>{new Date(order.createdAt).toLocaleString()} • {order.fulfillmentType}</p></div>
                <StatusBadge status={order.status} />
              </div>
              <div className="order-items">
                {order.items.map((item, index) => <span key={index}>{item.quantity}x {item.name}</span>)}
              </div>
              <div className="summary-row"><span>Total</span><b>Rs. {order.total}</b></div>
              <div className="summary-row"><span>{order.fulfillmentType === 'Dine-In' ? 'Estimated Waiting Time' : 'Estimated Delivery Time'}</span><b>{['Delivered','Served'].includes(order.status) ? 'Completed' : `${order.estimatedMinutes} mins`}</b></div>
              {order.fulfillmentType === 'Dine-In' && <div className="rider-box"><Utensils size={16} /> <strong>Dine-In:</strong> {order.dineInGuests} guests at {order.dineInTime}</div>}
              {order.fulfillmentType === 'Delivery' && order.riderName && <div className="rider-box"><Truck size={16} /> <strong>Rider:</strong> {order.riderName}<br /><strong>Contact:</strong> {order.riderPhone}</div>}
              <OrderTimeline timeline={order.timeline} />
            </div>
          ))}
          {orders.length === 0 && <p>No orders yet. Go to Food & Grocery and place your first order.</p>}
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>Reserve a Table</h2>
          <p>Choose restaurant, time and optionally pre-select food before arrival.</p>
        </div>
        <form className="reservation-form" onSubmit={submitReservation}>
          <div className="two-col">
            <div>
              <label>Restaurant</label>
              <select value={reservationForm.restaurant} onChange={(e) => loadMenu(e.target.value)}>
                <option value="">Select Restaurant</option>
                {restaurants.map((restaurant) => <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>)}
              </select>
            </div>
            <div><label>Guests</label><input type="number" min="1" value={reservationForm.guests} onChange={(e) => setReservationForm({ ...reservationForm, guests: e.target.value })} /></div>
            <div><label>Date</label><input type="date" value={reservationForm.date} onChange={(e) => setReservationForm({ ...reservationForm, date: e.target.value })} /></div>
            <div><label>Time</label><input type="time" value={reservationForm.time} onChange={(e) => setReservationForm({ ...reservationForm, time: e.target.value })} /></div>
            <div><label>Phone</label><input value={reservationForm.phone} onChange={(e) => setReservationForm({ ...reservationForm, phone: e.target.value })} /></div>
          </div>
          <label>Special Request</label>
          <textarea value={reservationForm.specialRequest} onChange={(e) => setReservationForm({ ...reservationForm, specialRequest: e.target.value })} placeholder="Birthday, family table, window side, etc." />

          {menu.length > 0 && <div className="preorder-box">
            <h3>Optional Pre-Order</h3>
            <div className="preorder-list">
              {menu.slice(0, 6).map((item) => (
                <button className="preorder-choice" type="button" key={item._id} onClick={() => addPreorder(item)}>
                  <img src={item.image} alt={item.name} />
                  <span>{item.name}</span>
                  <b>Rs. {item.price}</b>
                </button>
              ))}
            </div>
            {selectedPreorder.length > 0 && <p>Selected: {selectedPreorder.map((item) => `${item.quantity}x ${item.name}`).join(', ')}</p>}
          </div>}

          <button className="primary-btn">Submit Reservation</button>
        </form>
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>My Reservations</h2>
          <p>Admin confirmation will appear here.</p>
        </div>
        <div className="reservation-list">
          {reservations.map((reservation) => (
            <div className="reservation-card" key={reservation._id}>
              <div><h3>{reservation.reservationNumber}</h3><p>{reservation.restaurant?.name} • {reservation.date} at {reservation.time}</p><p>{reservation.guests} guests • Preorder Rs. {reservation.preorderTotal}</p></div>
              <StatusBadge status={reservation.status} />
            </div>
          ))}
          {reservations.length === 0 && <p>No reservations yet.</p>}
        </div>
      </section>
    </div>
  );
};

export default CustomerDashboard;

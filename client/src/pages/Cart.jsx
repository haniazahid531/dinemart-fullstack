import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Truck, Utensils } from 'lucide-react';
import { apiRequest } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Cart = ({ cart, updateQuantity, clearCart }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDineIn = cart.length > 0 && cart.every((item) => item.fulfillmentType === 'Dine-In');
  const isDelivery = cart.length > 0 && cart.every((item) => item.fulfillmentType !== 'Dine-In');

  const [form, setForm] = useState({
    deliveryAddress: user?.address || '',
    customerPhone: user?.phone || '',
    notes: '',
    dineInGuests: 2,
    dineInTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const hasFood = cart.some((item) => item.itemType === 'food');
  const hasGrocery = cart.some((item) => item.itemType === 'grocery');
  const deliveryFee = cart.length === 0 || isDineIn ? 0 : hasFood && hasGrocery ? 220 : 150;
  const estimated = cart.length === 0
    ? 0
    : isDineIn
      ? Math.max(15, ...cart.map((item) => Number(item.prepTime || 15))) + 10
      : hasFood && hasGrocery ? 55 : hasFood ? 40 : 30;
  const total = subtotal + deliveryFee;

  const checkout = async (e) => {
    e.preventDefault();
    setError('');

    if (!isDineIn && !isDelivery) {
      setError('Please do not mix dine-in and delivery items in one checkout. Remove one type and try again.');
      return;
    }

    setLoading(true);
    try {
      const items = cart.map(({ itemType, itemId, name, sourceName, quantity, price, image, fulfillmentType, prepTime }) => ({ itemType, itemId, name, sourceName, quantity, price, image, fulfillmentType, prepTime }));
      await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          fulfillmentType: isDineIn ? 'Dine-In' : 'Delivery',
          items
        })
      });
      clearCart();
      navigate('/customer?tab=orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="page narrow-page">
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p>Add food or grocery items to place an order.</p>
          <Link className="primary-btn" to="/shop">Browse Items</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <div className="section-header">
        <div>
          <span className="eyebrow">Checkout</span>
          <h1>{isDineIn ? 'Review dine-in order and confirm waiting time' : 'Review cart and place delivery order'}</h1>
          <p>{isDineIn ? 'Dine-in orders do not need a delivery address or rider. Admin will update preparation and ready status.' : 'Delivery orders need an address. Admin can assign a rider and customer can track contact/status.'}</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="cart-layout">
        <section className="panel">
          <div className="section-title compact-title">
            <div>
              <h2>Cart Items</h2>
              <p>Change quantity, remove one item, or clear the full cart before checkout.</p>
            </div>
            <div className="cart-top-actions">
              <span className="fulfillment-pill">{isDineIn ? <Utensils size={16} /> : <Truck size={16} />} {isDineIn ? 'Dine-In' : 'Delivery'}</span>
              <button type="button" className="ghost-btn tiny danger-text" onClick={clearCart}>Clear Cart</button>
            </div>
          </div>
          <div className="cart-list">
            {cart.map((item) => (
              <div className="cart-item" key={item.cartId}>
                <img src={item.image} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.sourceName} • {item.itemType} • {item.fulfillmentType}</p>
                  <strong>Rs. {item.price}</strong>
                </div>
                <div className="quantity-controls">
                  <button type="button" onClick={() => updateQuantity(item.cartId, item.quantity - 1)}><Minus size={14} /></button>
                  <input
                    className="quantity-input"
                    type="number"
                    min="1"
                    max={item.maxQuantity || 99}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.cartId, e.target.value)}
                    aria-label={`${item.name} quantity`}
                  />
                  <button type="button" disabled={item.quantity >= (item.maxQuantity || 99)} onClick={() => updateQuantity(item.cartId, item.quantity + 1)}><Plus size={14} /></button>
                  <button type="button" className="danger-icon" onClick={() => updateQuantity(item.cartId, 0)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <form className="panel checkout-card" onSubmit={checkout}>
          <h2>{isDineIn ? 'Dine-In Details' : 'Delivery Details'}</h2>
          <label>Phone Number</label>
          <input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />

          {isDineIn ? (
            <>
              <label>Number of Guests</label>
              <input type="number" min="1" value={form.dineInGuests} onChange={(e) => setForm({ ...form, dineInGuests: e.target.value })} />
              <label>Arrival / Dine-In Time</label>
              <input type="time" value={form.dineInTime} onChange={(e) => setForm({ ...form, dineInTime: e.target.value })} />
              <label>Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Table preference, spice level, etc." />
            </>
          ) : (
            <>
              <label>Delivery Address</label>
              <textarea value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} />
              <label>Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional delivery instructions" />
            </>
          )}

          <div className="summary-row"><span>Subtotal</span><b>Rs. {subtotal}</b></div>
          <div className="summary-row"><span>{isDineIn ? 'Service / Delivery Fee' : 'Delivery Fee'}</span><b>Rs. {deliveryFee}</b></div>
          <div className="summary-row"><span>{isDineIn ? 'Estimated Waiting Time' : 'Estimated Delivery Time'}</span><b>{estimated} mins</b></div>
          <div className="summary-row total"><span>Total</span><b>Rs. {total}</b></div>
          <button className="primary-btn full" disabled={loading}>{loading ? 'Placing Order...' : isDineIn ? 'Place Dine-In Order' : 'Place Delivery Order'}</button>
        </form>
      </div>
    </div>
  );
};

export default Cart;

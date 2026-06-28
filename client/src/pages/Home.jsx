import { Link } from 'react-router-dom';
import { Bike, CalendarCheck, ChartNoAxesCombined, Clock3, ShieldCheck, ShoppingCart, Utensils } from 'lucide-react';

const Home = () => {
  return (
    <div className="home-shell">
      <section className="page hero modern-hero">
        <div className="hero-content">
          <span className="eyebrow">Food • Grocery • Dine-In • Rider Delivery</span>
          <h1>A premium full-stack ordering system inspired by food delivery marketplaces.</h1>
          <p>
            DineMart lets customers order restaurant food, shop groceries, choose dine-in,
            reserve tables, track orders, and view assigned rider contact details in one connected MERN application.
          </p>
          <div className="hero-actions">
            <Link className="primary-btn" to="/shop">Explore Marketplace</Link>
            <Link className="ghost-btn dark" to="/login">Login Demo</Link>
          </div>
          <div className="trust-row">
            <span><ShieldCheck size={16} /> JWT Authentication</span>
            <span><Clock3 size={16} /> ETA Tracking</span>
            <span><Bike size={16} /> Rider Workflow</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card large-food">
            <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80" alt="Burger order" />
            <div><span>Restaurant delivery</span><strong>Urban Grill House</strong></div>
          </div>
          <div className="visual-card grocery-mini">
            <img src="https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80" alt="Fresh groceries" />
            <div><span>Grocery cart</span><strong>12 items</strong></div>
          </div>
          <div className="tracking-widget">
            <div className="tracking-icon"><Bike size={22} /></div>
            <div>
              <small>Assigned rider</small>
              <h3>Ali Rider</h3>
              <p>On the way • 18 mins left</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page feature-grid">
        <div className="feature-card"><ShoppingCart /><h3>Smart Cart</h3><p>Food, groceries and checkout rules are handled with proper cart logic.</p></div>
        <div className="feature-card"><Utensils /><h3>Dine-In Flow</h3><p>Customers can choose dine-in, enter guests and see estimated waiting time.</p></div>
        <div className="feature-card"><Bike /><h3>Rider Delivery</h3><p>Admin assigns riders, and customers see delivery status plus rider contact.</p></div>
        <div className="feature-card"><CalendarCheck /><h3>Reservations</h3><p>Customers reserve restaurant tables and optionally pre-select food.</p></div>
        <div className="feature-card"><ChartNoAxesCombined /><h3>Admin Dashboard</h3><p>Admin handles orders, reservations, riders, and business analytics.</p></div>
      </section>
    </div>
  );
};

export default Home;

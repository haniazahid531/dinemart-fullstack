import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = ({ cartCount }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'rider' ? '/rider' : '/customer';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-mark">DM</span>
        <span>DineMart</span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/shop">Food & Grocery</NavLink>
        {user?.role === 'customer' && <NavLink to="/cart">Cart ({cartCount})</NavLink>}
        {user && <NavLink to={dashboardPath}>Dashboard</NavLink>}
      </nav>

      <div className="nav-actions">
        {user ? (
          <>
            <span className="user-pill"><UserRound size={16} /> {user.name}</span>
            <button className="ghost-btn" onClick={handleLogout}><LogOut size={16} /> Logout</button>
          </>
        ) : (
          <>
            <Link className="ghost-btn" to="/login">Login</Link>
            <Link className="primary-btn small" to="/register"><ShoppingBag size={16} /> Register</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;

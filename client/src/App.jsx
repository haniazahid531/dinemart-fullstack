import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Shop from './pages/Shop.jsx';
import Cart from './pages/Cart.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import RiderDashboard from './pages/RiderDashboard.jsx';
import { useAuth } from './context/AuthContext.jsx';

const CART_KEY = 'dinemartCart';

function App() {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const addToCart = (product) => {
    setCart((current) => {
      const exists = current.find((item) => item.cartId === product.cartId);
      if (exists) {
        const maxQuantity = exists.maxQuantity || product.maxQuantity || 99;
        const nextQuantity = Math.min(exists.quantity + 1, maxQuantity);
        return current.map((item) => item.cartId === product.cartId ? { ...item, quantity: nextQuantity } : item);
      }
      return [...current, { ...product, quantity: 1, maxQuantity: product.maxQuantity || 99 }];
    });
  };

  const updateQuantity = (cartId, quantity) => {
    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setCart((current) => current.filter((item) => item.cartId !== cartId));
      return;
    }
    setCart((current) => current.map((item) => {
      if (item.cartId !== cartId) return item;
      const maxQuantity = item.maxQuantity || 99;
      return { ...item, quantity: Math.min(Math.floor(parsedQuantity), maxQuantity) };
    }));
  };

  const removeFromCart = (cartId) => setCart((current) => current.filter((item) => item.cartId !== cartId));

  const clearCart = () => setCart([]);

  const roleHome = user?.role === 'admin' ? '/admin' : user?.role === 'rider' ? '/rider' : '/customer';

  return (
    <>
      <Navbar cartCount={cartCount} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to={roleHome} /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to={roleHome} /> : <Register />} />
          <Route path="/shop" element={<Shop addToCart={addToCart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} cart={cart} />} />
          <Route path="/cart" element={<ProtectedRoute roles={['customer']}><Cart cart={cart} updateQuantity={updateQuantity} clearCart={clearCart} /></ProtectedRoute>} />
          <Route path="/customer" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/rider" element={<ProtectedRoute roles={['rider']}><RiderDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}

export default App;

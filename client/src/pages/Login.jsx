import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'rider' ? '/rider' : '/customer');
    } catch (err) {
      setError(err.message);
    }
  };

  const fill = (email, password) => setForm({ email, password });

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">Welcome back</span>
        <h2>Login to DineMart</h2>
        {error && <div className="alert error">{error}</div>}
        <label>Email</label>
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email" />
        <label>Password</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter password" />
        <button className="primary-btn full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        <p className="center-text">New customer? <Link to="/register">Create account</Link></p>
        <div className="demo-box">
          <strong>Demo Logins</strong>
          <button type="button" onClick={() => fill('customer@example.com', 'customer123')}>Use Customer</button>
          <button type="button" onClick={() => fill('admin@example.com', 'admin12345')}>Use Admin</button>
          <button type="button" onClick={() => fill('rider@example.com', 'rider12345')}>Use Rider</button>
        </div>
      </form>
    </div>
  );
};

export default Login;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/customer');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card wide" onSubmit={submit}>
        <span className="eyebrow">Customer account</span>
        <h2>Create your DineMart account</h2>
        {error && <div className="alert error">{error}</div>}
        <div className="two-col">
          <div><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label>Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        </div>
        <label>Delivery Address</label>
        <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <button className="primary-btn full" disabled={loading}>{loading ? 'Creating...' : 'Register as Customer'}</button>
        <p className="center-text">Already have account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Register;

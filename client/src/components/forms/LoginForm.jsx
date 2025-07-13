import React, { useState } from 'react';
import Button from '../ui/Button';

const LoginForm = ({ onLogin, loading, error }) => {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    await onLogin(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button
        type="submit"
        disabled={loading}
        loading={loading}
        variant="primary"
        size="lg"
        fullWidth
      >
        Login
      </Button>
    </form>
  );
};

export default LoginForm;

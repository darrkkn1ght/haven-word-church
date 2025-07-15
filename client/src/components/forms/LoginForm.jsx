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
        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
        required
        aria-label="Email address"
        autoComplete="email"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
        required
        aria-label="Password"
        autoComplete="current-password"
      />
      {error && <div className="text-red-600 dark:text-red-400 text-sm font-medium" role="alert">{error}</div>}
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

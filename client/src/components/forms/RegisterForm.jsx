import React, { useState } from 'react';
import Button from '../ui/Button';
import PropTypes from 'prop-types';

const RegisterForm = ({ onRegister, loading }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    await onRegister(form, setError);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
        required
        aria-label="Full Name"
        autoComplete="name"
      />
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
        autoComplete="new-password"
      />
      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
        aria-label="Role"
      >
        <option value="member">Member</option>
        <option value="pastor">Pastor</option>
        <option value="staff">Staff</option>
      </select>
      {error && <div className="text-red-600 dark:text-red-400 text-sm font-medium" role="alert">{error}</div>}
      <Button
        type="submit"
        disabled={loading}
        loading={loading}
        variant="primary"
        size="lg"
        fullWidth
      >
        Register
      </Button>
    </form>
  );
};



RegisterForm.propTypes = {
  onRegister: PropTypes.func,
  loading: PropTypes.bool
};

export default RegisterForm;

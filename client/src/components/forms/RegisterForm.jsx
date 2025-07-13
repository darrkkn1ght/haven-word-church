import React, { useState } from 'react';
import Button from '../ui/Button';

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
        className="w-full p-2 border rounded"
        required
      />
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
      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="member">Member</option>
        <option value="pastor">Pastor</option>
        <option value="staff">Staff</option>
      </select>
      {error && <div className="text-red-500 text-sm">{error}</div>}
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

import PropTypes from 'prop-types';

RegisterForm.propTypes = {
  onRegister: PropTypes.func,
  loading: PropTypes.bool
};

export default RegisterForm;

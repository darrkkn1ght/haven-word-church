import React, { useState } from 'react';
import RegisterForm from '../components/forms/RegisterForm';
import { register as registerService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (form, setError) => {
    setLoading(true);
    try {
      await registerService(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col justify-center items-center bg-gray-50 py-8">
        <div className="w-full max-w-md bg-white p-8 rounded shadow">
          <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
          <RegisterForm onRegister={handleRegister} loading={loading} />
          <p className="mt-4 text-sm text-center">
            Already have an account? <a href="/login" className="text-blue-600 underline">Login</a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;

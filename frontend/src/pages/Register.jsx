import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { registerUser } from '../services/api';
import AuthLayout from '../layouts/AuthLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await registerUser(formData);
      login(res.data.user, res.data.token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration Error:', err);
      toast.error(err.response?.data?.msg || 'Registration failed. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join the emergency response network today."
    >
      <form onSubmit={handleSubmit} className="space-y-1">
        <InputField 
          label="Full Name" 
          value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          error={errors.name}
        />
        <InputField 
          label="Email Address" 
          type="email"
          value={formData.email} 
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          error={errors.email}
        />
        <InputField 
          label="Phone Number" 
          type="tel"
          value={formData.phone} 
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          error={errors.phone}
        />
        <InputField 
          label="Password" 
          type="password"
          value={formData.password} 
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          error={errors.password}
        />
        <InputField 
          label="Confirm Password" 
          type="password"
          value={formData.confirmPassword} 
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          error={errors.confirmPassword}
        />

        <div className="pt-4">
          <Button loading={loading}>
            Create Account
          </Button>
        </div>

        <p className="mt-8 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

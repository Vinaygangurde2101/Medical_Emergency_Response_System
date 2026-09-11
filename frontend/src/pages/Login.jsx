import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Building2, ShieldAlert, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/api';
import AuthLayout from '../layouts/AuthLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return toast.error('Please fill in all fields');
    }

    setLoading(true);
    try {
      const res = await loginUser(formData);
      login(res.data.user, res.data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login Error:', err);
      toast.error(err.response?.data?.msg || 'Invalid credentials or server offline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Login to manage your medical emergency ID."
    >
      <form onSubmit={handleSubmit} className="space-y-2">
        <InputField 
          label="Email Address" 
          type="email"
          value={formData.email} 
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <div className="relative">
          <InputField 
            label="Password" 
            type={showPassword ? "text" : "password"}
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-4 text-gray-400 hover:text-primary transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <Button loading={loading}>
          Login as Patient
        </Button>

        {/* DIRECT PORTAL LINK SHORTCUTS */}
        <div className="pt-6 border-t border-gray-100 mt-6 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Are you Healthcare Staff or Admin?</p>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              to="/hospital"
              className="p-3 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all border border-blue-100"
            >
              <Building2 size={16} /> Hospital Portal
            </Link>
            <Link 
              to="/admin"
              className="p-3 bg-gray-900 text-white hover:bg-black rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all"
            >
              <ShieldAlert size={16} /> Admin Audit
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Create one now
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

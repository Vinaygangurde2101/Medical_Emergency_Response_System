import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, ShieldAlert, Lock, Server } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/api';
import AuthLayout from '../layouts/AuthLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';
import PortalSwitcher from '../components/PortalSwitcher';

export default function AdminLogin() {
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
      return toast.error('Please enter admin credentials');
    }

    setLoading(true);
    try {
      const cleanData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };
      const res = await loginUser(cleanData);

      if (res.data.user?.role !== 'ADMIN') {
        toast.error('ACCESS DENIED: Account does not have System Administrator privileges.');
        return;
      }

      login(res.data.user, res.data.token);
      toast.success('Admin Command Portal Access Granted');
      navigate('/admin');
    } catch (err) {
      console.error('Admin Login Error:', err);
      toast.error(err.response?.data?.msg || 'Admin authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="System Executive Control" 
      subtitle="Restricted System Administrator & Audit Log Command Center."
    >
      <PortalSwitcher currentPortal="admin" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField 
          label="Admin Account Email" 
          type="email"
          value={formData.email} 
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="e.g. admin@mers.com"
        />
        
        <div className="relative flex flex-col justify-end">
          <InputField 
            label="System Passcode" 
            type={showPassword ? "text" : "password"}
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="••••••••"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 bottom-3 text-slate-400 hover:text-slate-600 transition-colors"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-black hover:from-black hover:to-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-950/40 transition-all flex items-center justify-center gap-2 border border-slate-700"
        >
          <ShieldAlert size={16} className="text-red-500" />
          {loading ? 'Verifying Admin Privileges...' : 'Authenticate System Admin'}
        </button>

        <div className="pt-4 text-center space-y-1.5 text-xs text-slate-500 font-medium">
          <p>
            Demo Admin Credentials: <span className="font-mono font-bold text-slate-800">admin@mers.com</span> / <span className="font-mono font-bold text-slate-800">admin123</span>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

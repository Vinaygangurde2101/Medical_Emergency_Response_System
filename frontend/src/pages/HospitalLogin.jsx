import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Building2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { hospitalLogin } from '../services/api';
import AuthLayout from '../layouts/AuthLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';
import PortalSwitcher from '../components/PortalSwitcher';

export default function HospitalLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingError, setPendingError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPendingError('');
    if (!formData.email || !formData.password) {
      return toast.error('Please enter hospital email and password');
    }

    setLoading(true);
    try {
      const cleanData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };
      const res = await hospitalLogin(cleanData);
      login(res.data.user, res.data.token);
      toast.success(`Verified Access Granted: ${res.data.user.hospitalName || 'Hospital Center'}`);
      navigate('/hospital');
    } catch (err) {
      console.error('Hospital Login Error:', err);
      const msg = err.response?.data?.msg || 'Hospital staff login failed';
      if (msg.includes('PENDING') || msg.includes('pending')) {
        setPendingError(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Hospital Staff Portal" 
      subtitle="Authorized healthcare personnel & doctor medical record login."
    >
      <PortalSwitcher currentPortal="hospital" />

      {pendingError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-4 text-xs font-bold text-amber-900 space-y-1 animate-fadeIn">
          <div className="flex items-center gap-2 font-black text-amber-700">
            <AlertTriangle size={18} /> PENDING ADMIN VERIFICATION
          </div>
          <p>{pendingError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField 
          label="Hospital Official Email" 
          type="email"
          value={formData.email} 
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="e.g. hospital@mers.com"
        />
        
        <div className="relative flex flex-col justify-end">
          <InputField 
            label="Staff Access Password" 
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
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Verifying Hospital Credentials...' : 'Sign In To Hospital Portal'}
        </button>

        <div className="pt-4 text-center space-y-2 text-xs text-slate-500 font-medium">
          <p>
            Demo Hospital Credentials: <span className="font-mono font-bold text-slate-800">hospital@mers.com</span> / <span className="font-mono font-bold text-slate-800">hospital123</span>
          </p>
          <p>
            Need to register a new hospital?{' '}
            <Link to="/register" className="text-emerald-600 font-bold hover:underline">
              Submit Application
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

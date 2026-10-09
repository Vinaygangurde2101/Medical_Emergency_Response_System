import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Building2, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { registerUser, registerHospital } from '../services/api';
import AuthLayout from '../layouts/AuthLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';

export default function Register() {
  const [regType, setRegType] = useState('PATIENT'); // 'PATIENT' or 'HOSPITAL'

  // Patient Form State
  const [patientData, setPatientData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Hospital Form State
  const [hospData, setHospData] = useState({
    name: '',
    licenseNumber: '',
    city: '',
    address: '',
    contactPhone: '',
    email: '',
    password: '',
    doctorName: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [hospSubmitted, setHospSubmitted] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validatePatient = () => {
    const newErrors = {};
    if (!patientData.name.trim()) newErrors.name = 'Full name is required';
    if (!patientData.email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(patientData.email)) newErrors.email = 'Invalid email address format';
    if (!patientData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!patientData.password) newErrors.password = 'Password is required';
    else if (patientData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (patientData.password !== patientData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateHospital = () => {
    const newErrors = {};
    if (!hospData.name.trim()) newErrors.hospName = 'Hospital name is required';
    if (!hospData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!hospData.city.trim()) newErrors.city = 'City is required';
    if (!hospData.address.trim()) newErrors.address = 'Hospital address is required';
    if (!hospData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
    if (!hospData.email.trim()) newErrors.hospEmail = 'Official email is required';
    else if (!/\S+@\S+\.\S+/.test(hospData.email)) newErrors.hospEmail = 'Invalid email address format';
    if (!hospData.password) newErrors.hospPassword = 'Password is required';
    else if (hospData.password.length < 6) newErrors.hospPassword = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    if (!validatePatient()) return;

    setLoading(true);
    try {
      const payload = {
        name: patientData.name.trim(),
        email: patientData.email.trim().toLowerCase(),
        phone: patientData.phone.trim(),
        password: patientData.password
      };

      const res = await registerUser(payload);
      login(res.data.user, res.data.token);
      toast.success('Patient emergency account created!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration Error:', err);
      toast.error(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalSubmit = async (e) => {
    e.preventDefault();
    if (!validateHospital()) return;

    setLoading(true);
    try {
      const payload = {
        name: hospData.name.trim(),
        licenseNumber: hospData.licenseNumber.trim(),
        city: hospData.city.trim(),
        address: hospData.address.trim(),
        contactPhone: hospData.contactPhone.trim(),
        email: hospData.email.trim().toLowerCase(),
        password: hospData.password,
        doctorName: hospData.doctorName.trim()
      };

      const res = await registerHospital(payload);
      setHospSubmitted(true);
      toast.success(res.data?.msg || 'Hospital registration submitted! Pending Admin Verification.');
    } catch (err) {
      console.error('Hospital Reg Error:', err);
      toast.error(err.response?.data?.msg || 'Hospital registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Register as a Patient or apply for Hospital Network Authorization."
    >
      {/* Account Type Selector Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 font-extrabold text-xs">
        <button
          type="button"
          onClick={() => { setRegType('PATIENT'); setHospSubmitted(false); }}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
            regType === 'PATIENT' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User size={16} className={regType === 'PATIENT' ? 'text-blue-600' : ''} />
          <span>Patient Account</span>
        </button>

        <button
          type="button"
          onClick={() => setRegType('HOSPITAL')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
            regType === 'HOSPITAL' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 size={16} className={regType === 'HOSPITAL' ? 'text-emerald-600' : ''} />
          <span>Hospital Partner</span>
        </button>
      </div>

      {/* PATIENT REGISTRATION FORM */}
      {regType === 'PATIENT' && (
        <form onSubmit={handlePatientSubmit} className="space-y-1">
          <InputField 
            label="Full Name" 
            value={patientData.name} 
            onChange={(e) => setPatientData({...patientData, name: e.target.value})}
            error={errors.name}
          />
          <InputField 
            label="Email Address" 
            type="email"
            value={patientData.email} 
            onChange={(e) => setPatientData({...patientData, email: e.target.value})}
            error={errors.email}
          />
          <InputField 
            label="Phone Number" 
            type="tel"
            value={patientData.phone} 
            onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
            error={errors.phone}
          />
          <InputField 
            label="Password" 
            type="password"
            value={patientData.password} 
            onChange={(e) => setPatientData({...patientData, password: e.target.value})}
            error={errors.password}
          />
          <InputField 
            label="Confirm Password" 
            type="password"
            value={patientData.confirmPassword} 
            onChange={(e) => setPatientData({...patientData, confirmPassword: e.target.value})}
            error={errors.confirmPassword}
          />

          <div className="pt-4">
            <Button loading={loading}>
              Create Patient Account
            </Button>
          </div>
        </form>
      )}

      {/* HOSPITAL REGISTRATION FORM */}
      {regType === 'HOSPITAL' && (
        hospSubmitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="font-black text-slate-900 text-base">Hospital Registration Submitted</h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Your hospital license application has been received. Your status is <span className="font-bold text-amber-600 uppercase">PENDING ADMIN VERIFICATION</span>.
              An administrator will verify your license number before access is enabled.
            </p>
            <div className="pt-2">
              <Link to="/login" className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black">
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleHospitalSubmit} className="space-y-2 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800 font-bold flex items-start gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <span>Note: Registered hospitals require System Admin verification before staff logins are enabled.</span>
            </div>

            <InputField 
              label="Hospital Name" 
              value={hospData.name} 
              onChange={(e) => setHospData({...hospData, name: e.target.value})}
              error={errors.hospName}
            />

            <div className="grid grid-cols-2 gap-2">
              <InputField 
                label="License Number" 
                value={hospData.licenseNumber} 
                onChange={(e) => setHospData({...hospData, licenseNumber: e.target.value})}
                error={errors.licenseNumber}
              />
              <InputField 
                label="City" 
                value={hospData.city} 
                onChange={(e) => setHospData({...hospData, city: e.target.value})}
                error={errors.city}
              />
            </div>

            <InputField 
              label="Address" 
              value={hospData.address} 
              onChange={(e) => setHospData({...hospData, address: e.target.value})}
              error={errors.address}
            />

            <InputField 
              label="Lead Officer / Doctor Name" 
              value={hospData.doctorName} 
              onChange={(e) => setHospData({...hospData, doctorName: e.target.value})}
              placeholder="e.g. Dr. Sarah Connor"
            />

            <div className="grid grid-cols-2 gap-2">
              <InputField 
                label="Contact Phone" 
                type="tel"
                value={hospData.contactPhone} 
                onChange={(e) => setHospData({...hospData, contactPhone: e.target.value})}
                error={errors.contactPhone}
              />
              <InputField 
                label="Official Email" 
                type="email"
                value={hospData.email} 
                onChange={(e) => setHospData({...hospData, email: e.target.value})}
                error={errors.hospEmail}
              />
            </div>

            <InputField 
              label="Staff Account Password" 
              type="password"
              value={hospData.password} 
              onChange={(e) => setHospData({...hospData, password: e.target.value})}
              error={errors.hospPassword}
            />

            <div className="pt-3">
              <Button loading={loading}>
                Submit Hospital Application
              </Button>
            </div>
          </form>
        )
      )}

      <p className="mt-6 text-center text-slate-600 text-sm font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

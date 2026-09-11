import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEmergencyInfo, triggerFamilyContact, hospitalLogin, fetchVerifiedHospitalProfile } from '../services/api';
import { 
  ShieldAlert, 
  Phone, 
  Ambulance, 
  Droplet, 
  HeartPulse, 
  Building2, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Key, 
  AlertTriangle,
  UserCheck,
  ChevronRight,
  FileText,
  Eye,
  Activity,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/Loader';
import BloodBankModal from '../components/BloodBankModal';
import { toast } from 'react-hot-toast';

export default function EmergencyView() {
  const { qrId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // View Mode: 'PUBLIC' vs 'HOSPITAL'
  const [activeMode, setActiveMode] = useState('PUBLIC');

  // Modal States
  const [isBloodModalOpen, setIsBloodModalOpen] = useState(false);
  const [isContactingFamily, setIsContactingFamily] = useState(false);
  const [familyNotified, setFamilyNotified] = useState(false);
  
  // Hospital Login & Medical Profile States
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [hospitalCreds, setHospitalCreds] = useState({ email: 'hospital@mers.com', password: 'hospital123' });
  const [hospitalLoggingIn, setHospitalLoggingIn] = useState(false);
  const [fullMedicalData, setFullMedicalData] = useState(null);

  // First Aid Modal
  const [isFirstAidOpen, setIsFirstAidOpen] = useState(false);

  useEffect(() => {
    initEmergencyView();
  }, [qrId]);

  const initEmergencyView = async () => {
    setLoading(true);
    try {
      // 1. Load public responder info
      const res = await fetchEmergencyInfo(qrId);
      setData(res.data);

      // 2. Auto-detect if hospital token already exists in browser session
      const existingToken = localStorage.getItem('token') || localStorage.getItem('hospital_token');
      if (existingToken) {
        try {
          const profileRes = await fetchVerifiedHospitalProfile(qrId);
          setFullMedicalData(profileRes.data);
          setActiveMode('HOSPITAL');
        } catch (e) {
          // Token invalid or patient not found, default to public
        }
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const [familyDispatchData, setFamilyDispatchData] = useState(null);

  const handleContactFamily = async () => {
    setIsContactingFamily(true);
    try {
      let coords = null;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 }));
          coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch (e) {}
      }

      const res = await triggerFamilyContact({ qrId, location: coords });
      setFamilyNotified(true);
      if (res.data.dispatchData) {
        setFamilyDispatchData(res.data.dispatchData);
      }
      toast.success(res.data.msg || 'Emergency Family Contact Dispatched!');
    } catch (err) {
      toast.error('Failed to trigger emergency contact gateway.');
    } finally {
      setIsContactingFamily(false);
    }
  };

  const handleHospitalUnlock = async (e) => {
    if (e) e.preventDefault();
    setHospitalLoggingIn(true);
    try {
      const loginRes = await hospitalLogin(hospitalCreds);
      localStorage.setItem('token', loginRes.data.token);
      localStorage.setItem('hospital_token', loginRes.data.token);
      
      const profileRes = await fetchVerifiedHospitalProfile(qrId);
      setFullMedicalData(profileRes.data);
      setActiveMode('HOSPITAL');
      setIsHospitalModalOpen(false);
      toast.success(`Verified Hospital Access Granted: ${loginRes.data.user.hospitalName || 'Emergency Medical Center'}`);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Hospital authentication failed.');
    } finally {
      setHospitalLoggingIn(false);
    }
  };

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-red-600 text-white">
      <Loader size="lg" color="white" />
      <p className="mt-4 font-black tracking-widest animate-pulse">RESOLVING SECURE EMERGENCY TOKEN...</p>
    </div>
  );

  if (error) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-10 text-center bg-white">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
        <ShieldAlert size={40} />
      </div>
      <h1 className="text-2xl font-bold mb-2">Emergency QR Token Invalid</h1>
      <p className="text-gray-500 mb-8">This medical ID is invalid or has been deactivated by the patient.</p>
      <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold">
        Retry Scan
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-36 font-sans">
      {/* Top Banner */}
      <div className="bg-red-600 p-4 text-white text-center sticky top-0 z-40 shadow-xl border-b-4 border-red-700">
        <div className="flex items-center justify-center gap-2 mb-0.5">
          <ShieldAlert size={24} className="animate-pulse" />
          <h1 className="text-xl font-black tracking-tight uppercase">Emergency Healthcare Access</h1>
        </div>
        <p className="text-[10px] font-bold text-red-100 tracking-wider uppercase opacity-90">
          Single QR • Dual Role Gateway • Fast & Secure
        </p>
      </div>

      {/* QUICK DEMO SWITCHER BAR (For Presentation Ease) */}
      <div className="bg-slate-900 text-white p-2.5 px-4 flex items-center justify-between shadow-inner text-xs font-bold">
        <div className="flex items-center gap-2 text-slate-300">
          <Sparkles size={14} className="text-amber-400" />
          <span>QR View Mode:</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setActiveMode('PUBLIC')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 text-[11px] ${
              activeMode === 'PUBLIC' ? 'bg-red-600 text-white font-extrabold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🧑‍🚒 Responder (Public)
          </button>
          <button 
            onClick={() => {
              if (fullMedicalData) {
                setActiveMode('HOSPITAL');
              } else {
                setIsHospitalModalOpen(true);
              }
            }}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 text-[11px] ${
              activeMode === 'HOSPITAL' ? 'bg-blue-600 text-white font-extrabold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🏥 Verified Hospital
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-xl mx-auto w-full flex-1 space-y-6">
        {/* Patient Identifier Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-black mb-3">
            <ShieldCheck size={14} /> MERS Emergency Token Verified
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
            {activeMode === 'HOSPITAL' && fullMedicalData ? fullMedicalData.patientName : (data.patientName || 'Emergency Patient')}
          </h2>
          <p className="text-xs text-gray-400 font-medium">QR Token: <code className="font-mono text-gray-600">{qrId}</code></p>
        </div>

        {/* 🏥 VERIFIED HOSPITAL ACCESS VIEW ON SAME SCREEN */}
        {activeMode === 'HOSPITAL' && fullMedicalData ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border-2 border-blue-500 space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-blue-400">
                <UserCheck size={22} />
                <span className="font-extrabold text-sm uppercase tracking-wider">Verified Hospital Access Granted</span>
              </div>
              <span className="text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full">AUDITED LOG</span>
            </div>

            {/* Blood Group */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BLOOD GROUP</span>
                <div className="text-4xl font-black text-red-500 mt-1">{fullMedicalData.bloodGroup}</div>
              </div>
              <Droplet size={40} className="text-red-500 animate-pulse" />
            </div>

            {/* Allergies & Conditions */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} /> Known Allergies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {fullMedicalData.allergies?.length ? fullMedicalData.allergies.map((a, i) => (
                    <span key={i} className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-xl text-xs font-extrabold">
                      {a}
                    </span>
                  )) : <span className="text-xs text-slate-500">No known allergies registered</span>}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Activity size={14} /> Medical Conditions & Diseases
                </h4>
                <div className="flex flex-wrap gap-2">
                  {fullMedicalData.diseases?.length ? fullMedicalData.diseases.map((d, i) => (
                    <span key={i} className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-xl text-xs font-extrabold">
                      {d}
                    </span>
                  )) : <span className="text-xs text-slate-500">No chronic diseases listed</span>}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Current Daily Medications</h4>
                <ul className="list-disc list-inside text-xs font-semibold text-slate-200 space-y-1">
                  {fullMedicalData.medications?.length ? fullMedicalData.medications.map((m, i) => (
                    <li key={i}>{m}</li>
                  )) : <li className="text-slate-500">No daily medications recorded</li>}
                </ul>
              </div>

              {fullMedicalData.emergencyContacts?.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-2">Registered Emergency Contacts</h4>
                  <div className="space-y-2">
                    {fullMedicalData.emergencyContacts.map((c, i) => (
                      <div key={i} className="bg-slate-950 p-3 rounded-xl flex items-center justify-between text-xs border border-slate-800">
                        <div>
                          <strong className="text-white font-bold">{c.name}</strong> ({c.relation})
                        </div>
                        <a href={`tel:${c.phone}`} className="text-blue-400 font-mono font-bold hover:underline flex items-center gap-1">
                          <Phone size={12} /> {c.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* 🧑‍🚒 FIRST RESPONDER PUBLIC VIEW - MINIMUM DATA EXPOSURE */
          <div className="space-y-4">
            {/* Contact Family Gateway Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 text-red-600 font-extrabold text-sm mb-1">
                  <Phone size={18} /> ANONYMIZED FAMILY NOTIFICATION
                </div>
                <p className="text-xs text-gray-500">
                  Notify registered emergency contacts instantly through gateway proxy without exposing private phone numbers publicly.
                </p>
              </div>

              {familyNotified ? (
                <div className="w-full space-y-2">
                  <div className="w-full bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 text-xs font-extrabold border border-emerald-100">
                    <CheckCircle2 size={20} className="flex-shrink-0" />
                    Emergency family contacts notified & logged!
                  </div>
                  {familyDispatchData?.whatsappUrl && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={familyDispatchData.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-3 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Phone size={14} /> Send WhatsApp
                      </a>
                      <a
                        href={familyDispatchData.smsUrl}
                        className="py-3 px-2 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Phone size={14} /> Send SMS
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleContactFamily}
                  disabled={isContactingFamily}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-red-600/20 active:scale-95 transition-all"
                >
                  {isContactingFamily ? <Loader size="sm" color="white" /> : <Phone size={20} />}
                  CONTACT FAMILY NOW
                </button>
              )}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => window.open('tel:108')}
                className="bg-gray-900 text-white p-5 rounded-3xl font-extrabold text-sm flex flex-col items-center justify-center gap-2 shadow-lg hover:bg-black transition-all"
              >
                <Ambulance size={32} className="text-red-500" />
                <span>CALL 108 AMBULANCE</span>
              </button>

              <button
                onClick={() => setIsFirstAidOpen(true)}
                className="bg-blue-600 text-white p-5 rounded-3xl font-extrabold text-sm flex flex-col items-center justify-center gap-2 shadow-lg hover:bg-blue-700 transition-all"
              >
                <HeartPulse size={32} className="text-blue-200" />
                <span>FIRST-AID ASSISTANT</span>
              </button>
            </div>

            <button
              onClick={() => setIsBloodModalOpen(true)}
              className="w-full bg-white text-gray-800 border-2 border-red-100 hover:border-red-300 p-4 rounded-3xl font-extrabold text-sm flex items-center justify-center gap-3 shadow-sm transition-all"
            >
              <Droplet size={20} className="text-red-600" />
              FIND NEARBY BLOOD BANK
            </button>

            {/* Hospital Staff Access Door on Same Screen */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden mt-6 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-blue-400 font-extrabold text-sm">
                  <Lock size={18} /> FULL MEDICAL PROFILE LOCKED
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full font-bold uppercase">Role Guarded</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Hospital staff & doctors can log in below to unlock complete medical records on this screen.
              </p>
              <button
                onClick={() => setIsHospitalModalOpen(true)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
              >
                <Building2 size={18} /> UNLOCK FULL MEDICAL PROFILE (HOSPITAL STAFF)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BLOOD BANK MODAL */}
      <BloodBankModal 
        isOpen={isBloodModalOpen} 
        onClose={() => setIsBloodModalOpen(false)} 
      />

      {/* HOSPITAL LOGIN MODAL */}
      <AnimatePresence>
        {isHospitalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-2 text-blue-600 font-extrabold">
                  <Building2 size={24} />
                  <span>Hospital Staff Authentication</span>
                </div>
                <button onClick={() => setIsHospitalModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleHospitalUnlock} className="space-y-4">
                <div className="bg-blue-50 text-blue-700 p-3 rounded-2xl text-xs font-semibold">
                  Only verified hospital staff accounts can unlock full medical records.
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Staff Email</label>
                  <input 
                    type="email"
                    required
                    value={hospitalCreds.email}
                    onChange={e => setHospitalCreds({ ...hospitalCreds, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="hospital@mers.com"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Password</label>
                  <input 
                    type="password"
                    required
                    value={hospitalCreds.password}
                    onChange={e => setHospitalCreds({ ...hospitalCreds, password: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={hospitalLoggingIn}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                  >
                    {hospitalLoggingIn ? <Loader size="sm" color="white" /> : <Key size={18} />}
                    AUTHENTICATE & UNLOCK INLINE
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FIRST AID QUICK MODAL */}
      <AnimatePresence>
        {isFirstAidOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2 text-blue-600 font-extrabold">
                  <HeartPulse size={24} />
                  <span>Emergency First-Aid Guide</span>
                </div>
                <button onClick={() => setIsFirstAidOpen(false)} className="p-2 text-gray-400 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 font-extrabold">
                  🚨 FOR LIFE THREATENING EMERGENCIES, CALL 108 IMMEDIATELY BEFORE PERFORMING FIRST AID.
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <h4 className="font-black text-sm text-gray-900">CPR Protocol (Unresponsive / No Breathing)</h4>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600 font-medium">
                    <li>Place hands in center of victim's chest.</li>
                    <li>Push hard and fast (100-120 beats per minute).</li>
                    <li>Continue until medical responders arrive.</li>
                  </ol>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <h4 className="font-black text-sm text-gray-900">Severe Bleeding</h4>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600 font-medium">
                    <li>Apply firm, continuous direct pressure with a clean cloth.</li>
                    <li>Elevate the bleeding site above heart level if possible.</li>
                    <li>Do NOT remove soaked cloths; add more layers on top.</li>
                  </ol>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <h4 className="font-black text-sm text-gray-900">Choking First-Aid</h4>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600 font-medium">
                    <li>Give 5 sharp back blows between shoulder blades.</li>
                    <li>Give 5 quick upward abdominal thrusts (Heimlich maneuver).</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 flex gap-3 z-30">
        <button 
          onClick={handleContactFamily}
          className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-600/20 active:scale-95 transition-all"
        >
          <Phone size={18} /> CONTACT FAMILY
        </button>
        <button 
          onClick={() => window.open('tel:108')}
          className="w-16 sm:w-20 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-black transition-all"
        >
          <Ambulance size={24} className="text-red-500" />
        </button>
      </div>
    </div>
  );
}

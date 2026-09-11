import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  Droplet, 
  AlertTriangle, 
  Pill, 
  FileText, 
  UserCheck, 
  Clock, 
  LogOut,
  Phone,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { fetchVerifiedHospitalProfile } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function HospitalDashboard() {
  const [qrIdInput, setQrIdInput] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!qrIdInput.trim()) return toast.error('Enter a valid Patient QR Token');

    setLoading(true);
    try {
      const cleanToken = qrIdInput.trim().replace(/^.*\/e\//, '');
      const res = await fetchVerifiedHospitalProfile(cleanToken);
      setPatientData(res.data);
      
      setScanHistory(prev => [
        { qrId: cleanToken, patientName: res.data.patientName, time: new Date().toLocaleTimeString() },
        ...prev.filter(h => h.qrId !== cleanToken)
      ]);

      toast.success(`Access Granted for ${res.data.patientName}`);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Patient QR lookup failed or access denied.');
      setPatientData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Hospital Top Bar */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-6 sm:px-10 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-600/20">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="font-black text-lg text-white tracking-tight leading-tight">MERS Hospital Staff Command Center</h1>
            <p className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={14} className="text-emerald-400" /> Authorized Emergency Healthcare Portal
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-black flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Exit Portal</span>
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Search & Quick Scans */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-blue-400 font-black text-sm uppercase tracking-wider">
              <Search size={18} /> Patient QR Token Search
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Scan patient QR badge or type the token ID below to view verified medical records:
            </p>

            <form onSubmit={handleLookup} className="space-y-3.5">
              <input 
                type="text" 
                value={qrIdInput}
                onChange={e => setQrIdInput(e.target.value)}
                placeholder="e.g. demo_qr_01 or /e/token"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
              >
                {loading ? 'Searching...' : 'FETCH VERIFIED PROFILE'}
              </button>
            </form>
          </div>

          {/* Recent Scans History */}
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock size={14} className="text-blue-400" /> Active Session Access Logs
            </h3>
            {scanHistory.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium">No patient records inspected in this active session.</p>
            ) : (
              <div className="space-y-2">
                {scanHistory.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQrIdInput(item.qrId);
                      fetchVerifiedHospitalProfile(item.qrId).then(res => setPatientData(res.data));
                    }}
                    className="w-full text-left p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-blue-500/50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">{item.patientName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{item.qrId}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{item.time}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Full Verified Patient Record Display */}
        <div className="lg:col-span-8">
          {patientData ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                <div>
                  <span className="text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                    <UserCheck size={14} className="text-emerald-400" /> Verified Medical Access Granted
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">{patientData.patientName}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">Patient QR Token: <span className="text-blue-400 font-bold">{patientData.qrId}</span></p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-3xl text-center flex-shrink-0">
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block">Blood Group</span>
                  <div className="text-4xl font-black text-red-500 mt-0.5">{patientData.bloodGroup}</div>
                </div>
              </div>

              {/* Allergies & Diseases Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} /> Allergies & Adverse Reactions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {patientData.allergies?.length ? patientData.allergies.map((a, i) => (
                      <span key={i} className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-xl text-xs font-black">
                        {a}
                      </span>
                    )) : <span className="text-xs text-slate-500 font-medium">No known allergies registered</span>}
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShieldAlert size={16} /> Chronic Conditions / Diseases
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {patientData.diseases?.length ? patientData.diseases.map((d, i) => (
                      <span key={i} className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3.5 py-1.5 rounded-xl text-xs font-black">
                        {d}
                      </span>
                    )) : <span className="text-xs text-slate-500 font-medium">No chronic conditions registered</span>}
                  </div>
                </div>
              </div>

              {/* Daily Medications & Surgeries */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Pill size={16} /> Current Daily Medications
                  </h4>
                  <ul className="list-disc list-inside text-xs font-semibold text-slate-300 space-y-1.5">
                    {patientData.medications?.length ? patientData.medications.map((m, i) => (
                      <li key={i}>{m}</li>
                    )) : <li className="text-slate-500">No daily prescriptions recorded</li>}
                  </ul>
                </div>

                {patientData.medicalHistory?.length > 0 && (
                  <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <FileText size={16} /> Past Medical History & Surgeries
                    </h4>
                    <ul className="list-disc list-inside text-xs font-semibold text-slate-300 space-y-1">
                      {patientData.medicalHistory.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Emergency Contacts */}
              {patientData.emergencyContacts?.length > 0 && (
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Phone size={16} className="text-blue-400" /> Verified Emergency Contacts
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {patientData.emergencyContacts.map((c, i) => (
                      <div key={i} className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-extrabold text-white block">{c.name}</span>
                          <span className="text-[10px] text-slate-400">{c.relation}</span>
                        </div>
                        <a href={`tel:${c.phone}`} className="text-blue-400 font-mono font-black hover:underline bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
                          {c.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-[480px] bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 shadow-inner">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-300 mb-1">No Patient Record Active</h3>
              <p className="text-xs text-slate-500 max-w-sm font-medium leading-relaxed">
                Enter a valid patient QR token on the left panel to pull authorized medical history and emergency contacts.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

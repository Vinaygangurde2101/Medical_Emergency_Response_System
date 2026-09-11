import React from 'react';
import { Droplet, AlertTriangle, Pill, Phone, ArrowUpRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function SummaryCard({ profile }) {
  const navigate = useNavigate();

  const stats = [
    { 
      icon: <Droplet className="text-red-500" size={22} />, 
      label: 'Blood Group', 
      value: profile?.bloodGroup || 'Not Set',
      sub: profile?.bloodGroup ? 'Verified Token' : 'Action Required',
      badgeBg: 'bg-red-50 border-red-100 text-red-700'
    },
    { 
      icon: <AlertTriangle className="text-amber-500" size={22} />, 
      label: 'Allergies Listed', 
      value: profile?.allergies?.length > 0 ? `${profile.allergies.length} Recorded` : 'None Listed',
      sub: profile?.allergies?.length > 0 ? profile.allergies.slice(0, 2).join(', ') : 'No known allergies',
      badgeBg: 'bg-amber-50 border-amber-100 text-amber-700'
    },
    { 
      icon: <Pill className="text-blue-500" size={22} />, 
      label: 'Current Medications', 
      value: profile?.medications?.length > 0 ? `${profile.medications.length} Prescribed` : 'None Active',
      sub: profile?.medications?.length > 0 ? `${profile.medications.length} daily entries` : 'No active prescriptions',
      badgeBg: 'bg-blue-50 border-blue-100 text-blue-700'
    },
    { 
      icon: <Phone className="text-emerald-500" size={22} />, 
      label: 'Emergency Contacts', 
      value: profile?.emergencyContacts?.length > 0 ? `${profile.emergencyContacts.length} Contacts` : 'Not Configured',
      sub: profile?.emergencyContacts?.length > 0 ? 'Proxy Alert Active' : 'Add family numbers',
      badgeBg: 'bg-emerald-50 border-emerald-100 text-emerald-700'
    },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200/80 h-full flex flex-col justify-between font-sans">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2 inline-flex items-center gap-1.5">
            <Activity size={12} /> Emergency Core Metrics
          </span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Medical Record Summary</h3>
        </div>

        <button 
          onClick={() => navigate('/profile')}
          className="p-3 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-2xl transition-all border border-slate-200/80 flex items-center gap-1 text-xs font-bold"
          title="Edit Profile"
        >
          <span>Manage</span>
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -3 }}
            className={`p-5 rounded-3xl border ${stat.badgeBg} transition-all duration-300 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                {stat.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200/60 text-slate-600">
                {stat.label}
              </span>
            </div>
            
            <div>
              <div className="text-xl font-black text-slate-900 tracking-tight">{stat.value}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5 truncate">{stat.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

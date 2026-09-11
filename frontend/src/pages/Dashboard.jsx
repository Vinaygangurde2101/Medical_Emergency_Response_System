import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchSummary } from '../services/api';
import Sidebar from '../components/dashboard/Sidebar';
import TopNavbar from '../components/dashboard/TopNavbar';
import QRCard from '../components/dashboard/QRCard';
import SummaryCard from '../components/dashboard/SummaryCard';
import ProgressCard from '../components/dashboard/ProgressCard';
import ActionCard from '../components/dashboard/ActionCard';
import Loader from '../components/Loader';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Activity, HeartPulse } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchSummary();
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to load profile summary');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans">
      <Loader size="lg" color="white" />
      <p className="mt-4 font-black tracking-widest text-xs text-blue-400 animate-pulse uppercase">
        Loading Emergency Profile...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/70 flex transition-all duration-300 font-sans selection:bg-blue-500 selection:text-white">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        logout={logout}
      />
      
      <div 
        className={`flex-1 transition-all duration-300 flex flex-col min-h-screen
          ${sidebarOpen ? 'md:ml-[270px]' : 'md:ml-[80px]'}`}
      >
        <TopNavbar user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-4 sm:p-8 lg:p-10 relative overflow-hidden">
          {/* Ambient background glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none -z-10" />

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto space-y-8"
          >
            {/* Banner Greeting */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl shadow-blue-900/15 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-white/10">
              <div className="relative z-10 max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold mb-3 border border-white/15 backdrop-blur-md">
                  <Sparkles size={14} className="text-blue-400" /> Real-time Anonymized Emergency Gateway Active
                </span>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  Welcome, {user?.name || 'Patient'}
                </h1>
                <p className="text-blue-100/80 text-xs sm:text-sm mt-2 font-normal leading-relaxed">
                  Your Smart Medical ID is live and accessible via secure QR token. Emergency contacts will be notified automatically if scanned.
                </p>
              </div>

              <div className="relative z-10 flex flex-row sm:flex-col gap-3 flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center">
                  <span className="text-[10px] uppercase tracking-widest text-blue-200 font-bold block">Status</span>
                  <span className="text-sm font-black text-emerald-400 flex items-center gap-1.5 justify-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    PROTECTED
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center">
                  <span className="text-[10px] uppercase tracking-widest text-blue-200 font-bold block">QR ID Token</span>
                  <span className="text-xs font-mono font-bold text-white">{user?.qrId || profile?.qrId || 'demo_qr_01'}</span>
                </div>
              </div>

              {/* Decorative circle overlay */}
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Top row cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 xl:col-span-8">
                <SummaryCard profile={profile} />
              </div>
              <div className="lg:col-span-5 xl:col-span-4">
                <QRCard qrId={user?.qrId || profile?.qrId} patientName={user?.name} scansCount={profile?.scansCount || 0} />
              </div>
            </div>

            {/* Bottom row cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 xl:col-span-4">
                 <ProgressCard profile={profile} />
              </div>
              <div className="lg:col-span-7 xl:col-span-8 flex">
                 <ActionCard />
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Building2, 
  FileText, 
  Bell, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Search, 
  RefreshCw,
  LogOut,
  Droplet,
  ShieldCheck
} from 'lucide-react';
import { fetchAdminStats, fetchAdminLogs, fetchAdminHospitals } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes, hospRes] = await Promise.all([
        fetchAdminStats(),
        fetchAdminLogs(),
        fetchAdminHospitals()
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data);
      setHospitals(hospRes.data);
    } catch (err) {
      toast.error('Failed to load administrative control data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Admin Navbar */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-6 sm:px-10 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center font-bold shadow-lg shadow-red-600/20">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="font-black text-lg text-white tracking-tight leading-tight">MERS Admin Command Portal</h1>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1 mt-0.5">
              <ShieldCheck size={14} className="text-red-500" /> Executive System Control & Audit Logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadAdminData} 
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button 
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-2xl text-xs font-black flex items-center gap-2 transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Exit Admin</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-blue-400 mb-2">
              <Users size={22} />
              <span className="text-[10px] font-black bg-blue-500/20 border border-blue-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">REGISTRATION</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white">{stats?.totalPatients || 0}</div>
            <p className="text-xs text-slate-400 font-bold mt-1">Registered Patients</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <Building2 size={22} />
              <span className="text-[10px] font-black bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">VERIFIED</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white">{stats?.totalHospitals || 0}</div>
            <p className="text-xs text-slate-400 font-bold mt-1">Authorized Hospitals</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-purple-400 mb-2">
              <FileText size={22} />
              <span className="text-[10px] font-black bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">SECURITY</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white">{stats?.totalAccessLogs || 0}</div>
            <p className="text-xs text-slate-400 font-bold mt-1">Audit Log Entries</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-red-400 mb-2">
              <Bell size={22} />
              <span className="text-[10px] font-black bg-red-500/20 border border-red-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">EMERGENCY</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white">{stats?.totalEmergencyNotifs || 0}</div>
            <p className="text-xs text-slate-400 font-bold mt-1">Emergency Triggers</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-3.5 px-2 font-black text-sm transition-all border-b-2 ${
              activeTab === 'overview' ? 'border-red-500 text-red-500' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Access Audit Logs
          </button>
          <button 
            onClick={() => setActiveTab('hospitals')}
            className={`pb-3.5 px-2 font-black text-sm transition-all border-b-2 ${
              activeTab === 'hospitals' ? 'border-red-500 text-red-500' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Registered Healthcare Network
          </button>
        </div>

        {/* Audit Logs Table */}
        {activeTab === 'overview' && (
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden p-6 sm:p-8 shadow-2xl">
            <h3 className="text-base font-black text-white mb-6 flex items-center gap-2">
              <Activity size={20} className="text-red-500" /> Real-time System Access Audit Trails
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-black tracking-widest">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">QR Token</th>
                    <th className="py-3.5 px-4">Access Type</th>
                    <th className="py-3.5 px-4">Hospital / Staff</th>
                    <th className="py-3.5 px-4">Action Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-semibold text-slate-300">
                  {logs.map((log, idx) => (
                    <tr key={log._id || idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-mono text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-blue-400">
                        {log.qrId}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          log.accessType === 'VERIFIED_HOSPITAL_ACCESS' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {log.accessType}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        {log.hospitalName !== 'N/A' ? log.hospitalName : log.staffName}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {log.actionDetails}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Hospitals Grid */}
        {activeTab === 'hospitals' && (
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Building2 size={20} className="text-emerald-400" /> Authorized Hospital Partners
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hospitals.map(hosp => (
                <div key={hosp._id} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-white text-base">{hosp.name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">License: {hosp.licenseNumber}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{hosp.address}, {hosp.city}</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-2xl text-xs font-black uppercase">
                    APPROVED
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

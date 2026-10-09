import React, { useState } from 'react';
import { Search, Clock, AlertTriangle, Building2, MapPin, Activity, Tag } from 'lucide-react';
import { lookupSchedule } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppointmentSearchWidget() {
  const [queryInput, setQueryInput] = useState('');
  const [result, setResult] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e, directQuery = null) => {
    if (e) e.preventDefault();
    const searchQuery = directQuery || queryInput;
    if (!searchQuery.trim()) {
      return toast.error('Enter an Appointment ID (e.g. APT-1001), Sr. No. (#1, #2), or Patient Name');
    }

    setLoading(true);
    try {
      const res = await lookupSchedule(searchQuery);
      setResult(res.data.data);
      setQueueInfo(res.data.queueInfo);
      toast.success(`Found Appointment ${res.data.data.appointmentId || 'APT-' + res.data.data.srNo} for ${res.data.data.patientName}`);
    } catch (err) {
      setResult(null);
      setQueueInfo(null);
      toast.error(err.response?.data?.msg || 'Appointment record not found');
    } finally {
      setLoading(false);
    }
  };

  const samplePresets = [
    { label: 'APT-1001', value: 'APT-1001' },
    { label: 'APT-1002', value: 'APT-1002' },
    { label: 'APT-1003', value: 'APT-1003' },
    { label: 'Sr. No. #1', value: '1' },
    { label: 'Sr. No. #2', value: '2' }
  ];

  return (
    <section className="py-12 px-4 sm:px-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white border-y border-slate-800 shadow-2xl relative overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-black uppercase tracking-wider">
            <Activity size={14} className="text-red-400" /> Live OPD Queue & Appointment Finder
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Instant Search by <span className="text-red-500">Appointment ID</span> or <span className="text-blue-400">Sr. No.</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium">
            Enter your unique Appointment Token ID (e.g. <span className="text-slate-200 font-mono font-bold">APT-1001</span>), assigned Sr. No. (#1, #2...), or Patient Name to pull live status.
          </p>
        </div>

        {/* Search Bar & Presets */}
        <div className="max-w-2xl mx-auto space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input 
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Enter Appointment ID (e.g. APT-1001), Sr. No. (#1, #2), or Patient Name..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono font-bold shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all flex-shrink-0"
            >
              {loading ? 'Searching...' : 'Search Appointment'}
            </button>
          </form>

          {/* Quick Presets */}
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-1">Demo Appointment IDs:</span>
            {samplePresets.map(preset => (
              <button
                key={preset.value}
                type="button"
                onClick={(e) => {
                  setQueryInput(preset.value);
                  handleSearch(e, preset.value);
                }}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition-all hover:scale-105"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result & Live Queue Card Display */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl"
            >
              {/* Header Queue Metrics */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Tag size={12} className="text-blue-400" /> Verified Appointment Token
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
                      {result.appointmentId || `APT-100${result.srNo}`}
                    </div>
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-mono text-xs font-black">
                      Sr. No. #{result.srNo}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Triage Badge */}
                  <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                    result.triage === 'EMERGENCY' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    result.triage === 'URGENT' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    <AlertTriangle size={14} /> {result.triage} TRIAGE
                  </span>

                  {/* Status Badge */}
                  <span className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    result.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse' :
                    result.status === 'COMPLETED' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {result.status === 'IN_PROGRESS' ? 'IN CABIN NOW' : result.status}
                  </span>
                </div>
              </div>

              {/* Patient Details & Doctor Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-300">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Patient Name</span>
                  <div className="text-base font-black text-white">{result.patientName}</div>
                  <div className="text-[11px] font-mono text-slate-400">{result.contact}</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Assigned Doctor & Cabin</span>
                  <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                    <Building2 size={15} /> {result.doctor}
                  </div>
                  <div className="text-xs text-slate-300 font-bold flex items-center gap-1">
                    <MapPin size={13} className="text-slate-500" /> {result.room}
                  </div>
                </div>
              </div>

              {/* Live Queue Estimate */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Estimated Wait Time</span>
                    <span className="text-base font-black text-white">{queueInfo?.estimatedWaitTime}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Current Doctor Calling</span>
                  <span className="text-sm font-black text-blue-400 font-mono">Sr. No. #{queueInfo?.currentCallingSrNo}</span>
                  <span className="text-[11px] text-slate-400 block font-medium">({queueInfo?.patientsAhead} Patients Ahead)</span>
                </div>
              </div>

              {result.notes && (
                <div className="text-slate-400 text-xs font-semibold bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 font-bold">Visit Reason / Clinical Notes:</span> {result.notes}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}

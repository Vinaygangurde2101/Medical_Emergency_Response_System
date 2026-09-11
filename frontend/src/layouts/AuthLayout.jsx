import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Lock, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 font-sans selection:bg-blue-500 selection:text-white">
      {/* Left Side - Hero & Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 justify-center items-center text-white p-12 relative overflow-hidden">
        {/* Background glow graphics */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md text-center relative z-10"
        >
          <Link to="/" className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl mb-8 border border-white/15 hover:bg-white/15 transition-all shadow-xl group">
            <div className="bg-blue-600 p-2.5 rounded-2xl group-hover:scale-105 transition-transform">
              <Shield size={32} className="text-white" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight block leading-tight">MERS <span className="text-blue-400">SID</span></span>
              <span className="text-[10px] text-blue-200 uppercase tracking-widest font-bold block">Smart Emergency ID</span>
            </div>
          </Link>

          <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-tight text-white">
            Instant Access.<br /><span className="text-blue-400">Life-Saving Security.</span>
          </h1>
          <p className="text-base text-blue-100/80 font-normal leading-relaxed max-w-sm mx-auto mb-10">
            Emergency medical profile gateway trusted by first responders and hospital networks nationwide.
          </p>

          <div className="grid grid-cols-3 gap-3 text-left">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                <Zap size={18} />
              </div>
              <div className="text-xl font-black text-white">2.4s</div>
              <div className="text-blue-200/80 text-[11px] font-medium">Scan Time</div>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                <Lock size={18} />
              </div>
              <div className="text-xl font-black text-white">100%</div>
              <div className="text-blue-200/80 text-[11px] font-medium">Encrypted</div>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-2">
                <HeartPulse size={18} />
              </div>
              <div className="text-xl font-black text-white">24/7</div>
              <div className="text-blue-200/80 text-[11px] font-medium">Active Alert</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Interactive Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-slate-900">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/95 dark:bg-slate-950/90 rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl relative z-10"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

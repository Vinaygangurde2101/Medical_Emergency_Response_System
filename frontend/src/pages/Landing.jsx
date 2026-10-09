import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Zap, Lock, Activity, ArrowRight, CheckCircle2, QrCode, PhoneCall, Sparkles } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { useTranslation } from '../context/LanguageContext';
import AppointmentSearchWidget from '../components/AppointmentSearchWidget';

export default function Landing() {
  const { t } = useTranslation();
  const features = [
    {
      icon: <Zap className="text-blue-600" size={26} />,
      title: "Instant 3-Second Access",
      desc: "Emergency responders get life-saving health details in under 3 seconds via high-res QR scan."
    },
    {
      icon: <Lock className="text-indigo-600" size={26} />,
      title: "Anonymized Proxy Security",
      desc: "Emergency family contacts are notified instantly via gateway proxy without publicly exposing phone numbers."
    },
    {
      icon: <Activity className="text-emerald-600" size={26} />,
      title: "Hospital Audit Verification",
      desc: "Full medical records, allergies, and daily prescriptions are protected behind role-based hospital staff login."
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 sm:pb-32 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-extrabold mb-6 border border-blue-100 shadow-sm">
                <Sparkles size={16} className="text-blue-600" />
                Smart Medical Emergency Response System (MERS)
              </span>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                {t('welcome')}. <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
                  Instantly Accessible.
                </span> Life Saving.
              </h1>
              <p className="text-base sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Scan QR. {t('saveLives')} The fastest, most secure way to share emergency blood group, allergy, and contact data with ER personnel.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 group">
                    <span>{t('createId')}</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-800 rounded-2xl font-black text-lg border-2 border-slate-200/80 hover:border-blue-500 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                  Login to Account
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 relative w-full max-w-md lg:max-w-none">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <div className="w-72 h-72 sm:w-88 sm:h-88 mx-auto bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border-2 border-red-500/20 flex flex-col items-center justify-center relative animate-pulse-qr">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100">
                  <QrCode size={28} />
                </div>
                
                {/* Simulated Scannable Badge */}
                <div className="w-48 h-48 bg-slate-900 rounded-2xl grid grid-cols-5 grid-rows-5 gap-1.5 p-3 opacity-90 shadow-inner">
                  {[...Array(25)].map((_, i) => (
                    <div key={i} className={`rounded-sm ${i % 2 === 0 || i % 3 === 0 ? 'bg-white' : 'bg-transparent'}`} />
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Emergency Token</span>
                  <span className="font-mono text-xs font-bold text-slate-800">MERS-SECURE-ID</span>
                </div>
              </div>
            </motion.div>
            
            {/* Background glowing orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-glow" />
          </div>
        </div>
      </section>

      {/* Live OPD & ER Appointment Search Widget */}
      <AppointmentSearchWidget />

      {/* Core Features */}
      <section className="bg-white py-20 sm:py-28 px-4 sm:px-8 relative z-10 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Built For Emergencies</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-3 mb-4 tracking-tight">Core Emergency Safety Features</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">Architected for maximum speed, security, and anonymity when every second counts.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className="p-8 rounded-[2.5rem] border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 bg-white shadow-md border border-slate-100 rounded-2xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm font-medium">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 sm:py-28 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">4-Step Workflow</span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-3 mb-10 tracking-tight">How MERS SID Works</h2>
              <div className="space-y-6">
                {[
                  "Register your free account & generate unique QR Token",
                  "Input vital blood group, allergies, medications & emergency contacts",
                  "Save QR image on lock screen or print emergency badge",
                  "First responders scan QR token in emergency to trigger alerts & call 108"
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 leading-snug">{step}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-white/10">
               <div className="relative z-10">
                 <CheckCircle2 size={56} className="mb-6 text-blue-300" />
                 <h3 className="text-3xl font-black mb-4 tracking-tight">Ready to Protect Your Life?</h3>
                 <p className="text-blue-100/80 mb-8 max-w-md text-sm font-medium leading-relaxed">
                   Set up your Smart Emergency ID in less than 2 minutes. Free for all citizens.
                 </p>
                 <Link to="/register" className="inline-block px-8 py-4 bg-white text-blue-700 rounded-2xl font-black text-base hover:bg-blue-50 transition-colors shadow-lg">
                   Create Free Emergency ID
                 </Link>
               </div>
               <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

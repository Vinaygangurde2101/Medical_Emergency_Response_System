import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Decorative Gradient Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-400/20 to-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-glow" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[45%] h-[50%] bg-gradient-to-tl from-emerald-400/15 to-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-glow" />

      <Navbar />
      
      <AnimatePresence mode="wait">
        <motion.main 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex-1 pt-20 pb-12"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  );
}

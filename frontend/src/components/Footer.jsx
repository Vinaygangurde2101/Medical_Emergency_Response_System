import React from 'react';
import { Shield, Globe, Mail, Share2, Code, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 py-20 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <Shield className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-2xl text-white tracking-tight">
                MERS <span className="text-primary">SID</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Empowering individuals and emergency responders with instant access to critical health data. Saving lives, one scan at a time.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Globe size={18} />} />
              <SocialIcon icon={<Mail size={18} />} />
              <SocialIcon icon={<Share2 size={18} />} />
              <SocialIcon icon={<Code size={18} />} />
            </div>
          </div>

          {/* Links Columns */}
          <FooterColumn title="Platform" links={['Dashboard', 'My Profile', 'QR Generation', 'Emergency View']} />
          <FooterColumn title="Company" links={['About Us', 'Contact', 'Privacy Policy', 'Terms of Use']} />

          {/* Newsletter Column */}
          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg">Stay Safe</h4>
            <p className="text-sm">Get the latest updates on emergency response tech.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all"
              />
              <button className="absolute right-2 top-2 p-1.5 bg-primary rounded-lg text-white hover:scale-105 transition-all">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs uppercase tracking-widest font-bold text-white/40">
            © {currentYear} MERS SID. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Security</a>
            <a href="#" className="hover:text-primary transition-colors">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }) {
  return (
    <motion.a 
      whileHover={{ y: -3, backgroundColor: 'rgba(37, 99, 235, 1)' }}
      href="#" 
      className="w-9 h-9 border border-white/10 rounded-lg flex items-center justify-center transition-all hover:text-white"
    >
      {icon}
    </motion.a>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div className="space-y-6">
      <h4 className="text-white font-bold text-lg">{title}</h4>
      <ul className="space-y-4">
        {links.map((link, i) => (
          <li key={i}>
            <a href="#" className="text-sm hover:text-primary hover:translate-x-1 inline-block transition-all">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

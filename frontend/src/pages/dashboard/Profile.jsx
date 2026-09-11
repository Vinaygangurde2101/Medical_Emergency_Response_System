import React, { useState, useEffect } from 'react';
import { 
  User, 
  Droplet, 
  AlertTriangle, 
  Pill, 
  Phone, 
  Save, 
  Plus, 
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Power,
  Activity,
  HeartPulse,
  Sparkles
} from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import TopNavbar from '../../components/dashboard/TopNavbar';
import Button from '../../components/Button';
import { fetchSummary, updateProfile } from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('medical');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [profile, setProfile] = useState({
    bloodGroup: '',
    allergies: [],
    medications: [],
    diseases: [],
    medicalHistory: [],
    emergencyContacts: [],
    isQrActive: true
  });

  const [newContact, setNewContact] = useState({ name: '', relation: '', phone: '' });
  const [showAddContact, setShowAddContact] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetchSummary();
      if (res.data) {
        setProfile({
          bloodGroup: res.data.bloodGroup || '',
          allergies: res.data.allergies || [],
          medications: res.data.medications || [],
          diseases: res.data.diseases || [],
          medicalHistory: res.data.medicalHistory || [],
          emergencyContacts: res.data.emergencyContacts || [],
          isQrActive: res.data.isQrActive !== false
        });
      }
    } catch (err) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(profile);
      toast.success('Medical Profile Updated Successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addArrayItem = (key, value) => {
    if (!value || !value.trim()) return;
    setProfile({ ...profile, [key]: [...(profile[key] || []), value.trim()] });
  };

  const removeArrayItem = (key, index) => {
    const newList = [...(profile[key] || [])];
    newList.splice(index, 1);
    setProfile({ ...profile, [key]: newList });
  };

  const handleAddContactSubmit = (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return toast.error('Contact name and phone required');
    setProfile({
      ...profile,
      emergencyContacts: [...(profile.emergencyContacts || []), newContact]
    });
    setNewContact({ name: '', relation: '', phone: '' });
    setShowAddContact(false);
    toast.success('Emergency contact added!');
  };

  const removeContact = (index) => {
    const contacts = [...(profile.emergencyContacts || [])];
    contacts.splice(index, 1);
    setProfile({ ...profile, emergencyContacts: contacts });
  };

  const tabs = [
    { id: 'medical', label: 'Medical Records', icon: <Droplet size={18} /> },
    { id: 'contacts', label: 'Emergency Contacts', icon: <Phone size={18} /> },
    { id: 'privacy', label: 'QR Security & Privacy', icon: <ShieldCheck size={18} /> },
  ];

  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black tracking-widest text-xs text-blue-400 uppercase">Loading Medical Profile...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/70 flex transition-all duration-300 font-sans selection:bg-blue-500 selection:text-white">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className={`flex-1 transition-all duration-300 flex flex-col min-h-screen ${sidebarOpen ? 'md:ml-[270px]' : 'md:ml-[80px]'}`}>
        <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-4 sm:p-8 lg:p-10 max-w-5xl mx-auto w-full space-y-8">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200/80">
            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2 inline-flex items-center gap-1">
                <Sparkles size={12} /> Patient Data Control
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Medical Profile & Privacy</h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                Configure life-saving emergency medical details accessible via QR scan.
              </p>
            </div>

            <button 
              onClick={handleSave} 
              disabled={saving}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-600/25 active:scale-95 transition-all flex items-center gap-2 flex-shrink-0"
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>

          {/* TAB BAR */}
          <div className="flex border-b border-slate-200/80 gap-2 overflow-x-auto no-scrollbar pb-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap relative
                  ${activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'}
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB CONTENT PANEL */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-10"
          >
            {activeTab === 'medical' && (
              <div className="space-y-8">
                {/* Blood Group Picker */}
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                    <Droplet size={16} className="text-red-500" /> Select Blood Group
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <button
                        key={bg}
                        onClick={() => setProfile({ ...profile, bloodGroup: bg })}
                        className={`py-3.5 rounded-2xl font-black text-base transition-all border-2
                          ${profile.bloodGroup === bg 
                            ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/25 scale-105' 
                            : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:border-red-300 hover:bg-red-50/50'}
                        `}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allergies Tag Input */}
                <div className="pt-6 border-t border-slate-100">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" /> Known Allergies & Adverse Reactions
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profile.allergies?.map((allergy, i) => (
                      <span key={i} className="bg-amber-50 text-amber-800 px-4 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-2 border border-amber-200/80 shadow-sm">
                        {allergy}
                        <button onClick={() => removeArrayItem('allergies', i)} className="p-1 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      id="add-allergy-input"
                      type="text" 
                      placeholder="e.g. Penicillin, Peanuts, Sulfa..." 
                      className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('allergies', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const inp = document.getElementById('add-allergy-input');
                        addArrayItem('allergies', inp.value);
                        inp.value = '';
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl transition-all shadow-md shadow-blue-600/20"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {/* Diseases & Chronic Conditions */}
                <div className="pt-6 border-t border-slate-100">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                    <Activity size={16} className="text-blue-500" /> Chronic Medical Conditions
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profile.diseases?.map((disease, i) => (
                      <span key={i} className="bg-blue-50 text-blue-800 px-4 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-2 border border-blue-200/80 shadow-sm">
                        {disease}
                        <button onClick={() => removeArrayItem('diseases', i)} className="p-1 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      id="add-disease-input"
                      type="text" 
                      placeholder="e.g. Diabetes, Asthma, Hypertension..." 
                      className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('diseases', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const inp = document.getElementById('add-disease-input');
                        addArrayItem('diseases', inp.value);
                        inp.value = '';
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl transition-all shadow-md shadow-blue-600/20"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {/* Medications */}
                <div className="pt-6 border-t border-slate-100">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                    <Pill size={16} className="text-indigo-500" /> Daily Medications
                  </label>
                  <div className="space-y-2.5 mb-3">
                    {profile.medications?.map((med, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Pill size={16} />
                          </div>
                          <span className="font-bold text-slate-800 text-sm">{med}</span>
                        </div>
                        <button onClick={() => removeArrayItem('medications', i)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      id="add-medication-input"
                      type="text" 
                      placeholder="e.g. Insulin 10 units before meals, Metformin 500mg..." 
                      className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('medications', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const inp = document.getElementById('add-medication-input');
                        addArrayItem('medications', inp.value);
                        inp.value = '';
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-2xl transition-all shadow-md shadow-blue-600/20"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-8">
                <div className="bg-emerald-50 text-emerald-800 p-6 rounded-3xl border border-emerald-200/80 flex gap-4">
                  <CheckCircle2 size={24} className="flex-shrink-0 text-emerald-600" />
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">
                    When first responders scan your QR code and tap <strong>"Contact Family"</strong>, automated emergency alerts will be dispatched to these contacts via anonymized proxy gateway.
                  </p>
                </div>

                <div className="space-y-3">
                  {profile.emergencyContacts?.map((c, i) => (
                    <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-slate-900 text-base">{c.name}</h4>
                        <span className="text-xs font-bold text-slate-400 block">{c.relation || 'Emergency Contact'}</span>
                        <p className="text-sm font-mono font-bold text-slate-700 mt-1">{c.phone}</p>
                      </div>
                      <button onClick={() => removeContact(i)} className="p-3 text-slate-400 hover:text-red-600 rounded-xl transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>

                {showAddContact ? (
                  <form onSubmit={handleAddContactSubmit} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                    <h4 className="font-extrabold text-slate-900 text-base">New Emergency Contact</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input 
                        type="text" 
                        placeholder="Name (e.g. Jane Doe)"
                        required
                        value={newContact.name}
                        onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold"
                      />
                      <input 
                        type="text" 
                        placeholder="Relation (e.g. Spouse / Parent)"
                        value={newContact.relation}
                        onChange={e => setNewContact({ ...newContact, relation: e.target.value })}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold"
                      />
                      <input 
                        type="tel" 
                        placeholder="Phone (e.g. +91 9876543210)"
                        required
                        value={newContact.phone}
                        onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => setShowAddContact(false)}
                        className="px-5 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md"
                      >
                        Save Contact
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setShowAddContact(true)}
                    className="w-full py-8 border-2 border-dashed border-slate-200/80 rounded-[2rem] text-slate-500 font-bold hover:border-blue-300 hover:text-blue-600 transition-all flex flex-col items-center gap-2"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <Plus size={20} />
                    </div>
                    Add Emergency Family Contact Number
                  </button>
                )}
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Power size={18} className={profile.isQrActive ? 'text-emerald-500' : 'text-red-500'} />
                      Emergency QR Gateway Status
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                      {profile.isQrActive 
                        ? 'Your emergency QR code is currently ACTIVE and scannable by first responders.' 
                        : 'Your emergency QR code is DEACTIVATED. Public emergency scans will be blocked.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setProfile({ ...profile, isQrActive: !profile.isQrActive })}
                    className={`px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-md flex-shrink-0 ${
                      profile.isQrActive ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {profile.isQrActive ? 'Deactivate QR Gateway' : 'Activate QR Gateway'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

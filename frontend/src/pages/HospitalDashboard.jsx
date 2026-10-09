import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Upload,
  Plus,
  CheckCircle2,
  ListOrdered,
  XCircle,
  FileSpreadsheet,
  Users,
  Activity,
  Trash2,
  Filter
} from 'lucide-react';
import { 
  fetchVerifiedHospitalProfile, 
  fetchScheduleAll, 
  uploadScheduleFile, 
  uploadScheduleDocumentFile,
  updateScheduleStatus,
  addSingleSchedule,
  deleteScheduleSingle,
  clearScheduleAll
} from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' (Search Patient) or 'appointments' (Appointment Queue)
  const [qrIdInput, setQrIdInput] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  // Schedule Management State
  const [schedules, setSchedules] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddSingleModal, setShowAddSingleModal] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [singleForm, setSingleForm] = useState({ patientName: '', doctor: '', room: '', time: '10:30 AM', triage: 'ROUTINE', notes: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Unwanted Lines & Disclaimers Filter Inspection State
  const [excludedLines, setExcludedLines] = useState([]);
  const [showExcludedLines, setShowExcludedLines] = useState(false);

  useEffect(() => {
    loadDailySchedule();
  }, []);

  const loadDailySchedule = async () => {
    try {
      const res = await fetchScheduleAll();
      setSchedules(res.data.data || []);
    } catch (err) {
      console.error('Failed to load daily schedule:', err);
    }
  };

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!qrIdInput.trim()) return toast.error('Enter a valid Sr. No., Appointment ID, or Patient QR Token');

    setLoading(true);
    try {
      const cleanToken = qrIdInput.trim().replace(/^.*\/e\//, '');
      const cleanQuery = cleanToken.replace(/^#/, '').toLowerCase();

      // First check locally in active schedule array by Sr. No., Apt ID, or Name
      const matchSchedule = schedules.find(s => 
        s.srNo.toString() === cleanQuery ||
        (s.appointmentId && s.appointmentId.toLowerCase() === cleanQuery) ||
        (s.appointmentId && s.appointmentId.toLowerCase() === `apt-${cleanQuery}`) ||
        s.patientName.toLowerCase().includes(cleanQuery)
      );

      if (matchSchedule) {
        setPatientData({
          patientName: matchSchedule.patientName,
          qrId: matchSchedule.appointmentId || `APT-100${matchSchedule.srNo}`,
          bloodGroup: 'B+',
          allergies: [matchSchedule.notes || 'No known allergies'],
          diseases: [`Assigned Doctor: ${matchSchedule.doctor}`],
          medications: [
            `Scheduled Time: ${matchSchedule.time}`, 
            `Cabin: ${matchSchedule.room}`, 
            `Triage Priority: ${matchSchedule.triage}`,
            `Status: ${matchSchedule.status || 'WAITING'}`
          ]
        });
        toast.success(`Found Appointment for ${matchSchedule.patientName} (Sr. No. #${matchSchedule.srNo})`);
      } else {
        // Fallback to backend API search
        const res = await fetchVerifiedHospitalProfile(cleanToken);
        setPatientData(res.data);
        toast.success(`Access Granted for ${res.data.patientName}`);
      }

      setScanHistory(prev => [
        { qrId: cleanToken, patientName: matchSchedule ? matchSchedule.patientName : cleanToken, time: new Date().toLocaleTimeString() },
        ...prev.filter(h => h.qrId !== cleanToken)
      ]);

    } catch (err) {
      toast.error(err.response?.data?.msg || 'Patient search failed. Please check the Sr. No. or QR Token.');
      setPatientData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToSearch = (presetQuery = '') => {
    setActiveTab('home');
    if (presetQuery) {
      setQrIdInput(presetQuery);
    }
    setTimeout(() => {
      const inputEl = document.getElementById('hospital-patient-search-input');
      if (inputEl) {
        inputEl.focus();
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Schedule Actions
  const handleScheduleTextUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile && !pastedText.trim()) {
      return toast.error('Please select a PDF, DOCX, or CSV file, or paste text lines');
    }

    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('replaceExisting', 'true');

        res = await uploadScheduleDocumentFile(formData);
      } else {
        res = await uploadScheduleFile({ textContent: pastedText, replaceExisting: true });
      }

      toast.success(res.data.msg);

      if (res.data.excludedLines && res.data.excludedLines.length > 0) {
        setExcludedLines(res.data.excludedLines);
        toast(`Filtered ${res.data.excludedLines.length} disclaimers/noise lines`, { icon: '🧹' });
      } else {
        setExcludedLines([]);
      }

      setShowUploadModal(false);
      setSelectedFile(null);
      setPastedText('');
      loadDailySchedule();
    } catch (err) {
      console.error('File Upload Error:', err);
      toast.error(err.response?.data?.msg || 'Failed to parse document file');
    }
  };

  const handleFileDrop = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    
    // For text/csv files, pre-read preview text
    if (file.type.includes('text') || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPastedText(evt.target.result);
      };
      reader.readAsText(file);
    } else {
      setPastedText(`[Selected File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`);
    }
  };

  const handleAddSingle = async (e) => {
    e.preventDefault();
    if (!singleForm.patientName.trim()) return toast.error('Patient Name is required');

    try {
      await addSingleSchedule(singleForm);
      toast.success('Patient added to daily appointment queue!');
      setShowAddSingleModal(false);
      setSingleForm({ patientName: '', doctor: '', room: '', time: '10:30 AM', triage: 'ROUTINE', notes: '' });
      loadDailySchedule();
    } catch (err) {
      toast.error('Failed to add appointment');
    }
  };

  const handleStatusChange = async (id, newStatus, srNo) => {
    try {
      await updateScheduleStatus({ id, status: newStatus, srNo });
      toast.success(`Sr. No. #${srNo} status updated to ${newStatus}`);
      loadDailySchedule();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeletePatient = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name} from the queue?`)) return;

    try {
      await deleteScheduleSingle(id);
      toast.success(`Deleted patient: ${name}`);
      loadDailySchedule();
    } catch (err) {
      toast.error('Failed to delete patient record');
    }
  };

  const handleClearAllQueue = async () => {
    if (!window.confirm('Are you sure you want to clear ALL patients from today\'s appointment queue?')) return;

    try {
      await clearScheduleAll();
      toast.success('Cleared all patients from appointment queue');
      setExcludedLines([]);
      loadDailySchedule();
    } catch (err) {
      toast.error('Failed to clear queue');
    }
  };

  const completedCount = schedules.filter(s => s.status === 'COMPLETED').length;
  const pendingCount = schedules.filter(s => s.status !== 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white pb-16">
      {/* Hospital Top Bar */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-6 sm:px-10 py-4 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-600/20">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="font-black text-lg text-white tracking-tight leading-tight">MERS Hospital Command Center</h1>
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

      {/* Sub-Header Tab Navigation & Action Controls Bar */}
      <div className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 px-6 sm:px-10 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-[73px] z-20">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition-all ${
              activeTab === 'home'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Search size={16} />
            <span>Search Patient Record</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition-all ${
              activeTab === 'appointments'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <ListOrdered size={16} />
            <span>Appointment Patients & Queue</span>
            {schedules.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'appointments' ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {schedules.length}
              </span>
            )}
          </button>
        </div>

        {/* Dedicated Tab Action Controls */}
        {activeTab === 'appointments' && (
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => setShowAddSingleModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all"
            >
              <Plus size={15} /> Add Patient
            </button>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all"
            >
              <FileSpreadsheet size={15} /> Import Schedule File
            </button>
            {schedules.length > 0 && (
              <button 
                onClick={handleClearAllQueue}
                className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-xl text-xs font-bold border border-red-800/50 flex items-center gap-1.5 transition-all"
                title="Clear all patients from today's queue"
              >
                <Trash2 size={15} /> Clear All
              </button>
            )}
          </div>
        )}
      </div>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* TAB 1: SEARCH PATIENT RECORD */}
        {activeTab === 'home' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-900/40 rounded-[2.5rem] border border-blue-500/20 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full">
                  Hospital Patient Search Desk
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">Search Patient Record</h2>
                <p className="text-xs text-slate-400 font-medium mt-1 max-w-xl">
                  Enter Patient <b>Serial Number (#1, #2...)</b>, Appointment ID, or Scan QR token to view complete patient details and medical history.
                </p>
              </div>

              <button 
                onClick={() => setActiveTab('appointments')}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all flex-shrink-0"
              >
                <ListOrdered size={16} className="text-emerald-400" />
                View Daily Appointment Queue ({schedules.length})
              </button>
            </div>

            {/* Patient Search & Profile Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Search Form & Quick Scans */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-blue-400 font-black text-sm uppercase tracking-wider">
                    <Search size={18} /> Patient Lookup Engine
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Type Sr. No. (e.g. <span className="text-white font-bold">1</span> or <span className="text-white font-bold">#2</span>), Appointment ID (<span className="text-white font-bold">APT-1001</span>), or Patient Name:
                  </p>

                  <form onSubmit={handleLookup} className="space-y-3.5">
                    <input 
                      id="hospital-patient-search-input"
                      type="text" 
                      value={qrIdInput}
                      onChange={e => setQrIdInput(e.target.value)}
                      placeholder="e.g. 1, #2, APT-1001 or Name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
                    >
                      {loading ? 'Searching...' : 'SEARCH PATIENT RECORD'}
                    </button>
                  </form>
                </div>

                {/* Inspection Session History */}
                <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock size={14} className="text-blue-400" /> Recent Searched Records
                  </h3>
                  {scanHistory.length === 0 ? (
                    <p className="text-xs text-slate-500 font-medium">No patient records searched in this session.</p>
                  ) : (
                    <div className="space-y-2">
                      {scanHistory.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setQrIdInput(item.qrId);
                            handleRedirectToSearch(item.qrId);
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

              {/* Right Column: Verified Medical / Appointment Profile Display */}
              <div className="lg:col-span-8">
                {patientData ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                      <div>
                        <span className="text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                          <UserCheck size={14} className="text-emerald-400" /> Patient Record Verified
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">{patientData.patientName}</h2>
                        <p className="text-xs text-slate-400 font-mono mt-1">Reference ID: <span className="text-blue-400 font-bold">{patientData.qrId}</span></p>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-3xl text-center flex-shrink-0">
                        <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block">Blood Group</span>
                        <div className="text-4xl font-black text-red-500 mt-0.5">{patientData.bloodGroup}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
                        <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <AlertTriangle size={16} /> Allergies & Diagnosis Notes
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
                          <ShieldAlert size={16} /> Doctor & Department Info
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

                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Pill size={16} /> Appointment Schedule & Room Details
                        </h4>
                        <ul className="list-disc list-inside text-xs font-semibold text-slate-300 space-y-1.5">
                          {patientData.medications?.length ? patientData.medications.map((m, i) => (
                            <li key={i}>{m}</li>
                          )) : <li className="text-slate-500">No details recorded</li>}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-[380px] bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 shadow-inner">
                      <Search size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-300 mb-1">Search Patient Record</h3>
                    <p className="text-xs text-slate-500 max-w-sm font-medium leading-relaxed">
                      Type Patient Serial Number (e.g. <b>1</b>, <b>#2</b>), Appointment ID, or Name on the left panel to fetch record.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: APPOINTMENT PATIENTS & QUEUE TAB */}
        {activeTab === 'appointments' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Top Summary Banner Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Total Appointments</span>
                  <div className="text-3xl font-black text-white mt-1">{schedules.length}</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <Users size={24} />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">Pending Queue</span>
                  <div className="text-3xl font-black text-amber-400 mt-1">{pendingCount}</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Clock size={24} />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">Completed OPD</span>
                  <div className="text-3xl font-black text-emerald-400 mt-1">{completedCount}</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
              </div>
            </div>

            {/* Filtered Unwanted Lines Review Card */}
            {excludedLines.length > 0 && (
              <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Filter size={16} /> Filtered Unwanted Noise Lines & Disclaimers ({excludedLines.length})
                  </div>
                  <button 
                    onClick={() => setShowExcludedLines(!showExcludedLines)}
                    className="text-[10px] font-black text-slate-400 hover:text-white underline"
                  >
                    {showExcludedLines ? 'Hide Filter Details' : 'Inspect Filtered Lines'}
                  </button>
                </div>

                {showExcludedLines && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5 font-mono text-[11px] text-slate-400 max-h-44 overflow-y-auto">
                    {excludedLines.map((line, idx) => (
                      <div key={idx} className="truncate">
                        <span className="text-amber-500/80 font-bold mr-2">[Noise #{idx+1}]:</span>
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* OPD & Appointment Patients Desk Table */}
            <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <ListOrdered size={20} className="text-emerald-400" /> Daily OPD & Appointment Patient Queue
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Manage patient queue by Serial Number (#1, #2...) or update status manually.</p>
              </div>

              {/* Schedule Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-black tracking-widest text-[10px]">
                      <th className="py-3.5 px-4">Sr. No. / Apt ID</th>
                      <th className="py-3.5 px-4">Patient Name</th>
                      <th className="py-3.5 px-4">Assigned Doctor & Cabin</th>
                      <th className="py-3.5 px-4">Triage Priority</th>
                      <th className="py-3.5 px-4">Manual Status Update</th>
                      <th className="py-3.5 px-4 text-right">Desk Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                    {schedules.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500 text-xs font-medium">
                          No appointment patients in today's queue. Click <b>Import Schedule File</b> or <b>Add Patient</b> above to populate queue.
                        </td>
                      </tr>
                    ) : schedules.map((item) => (
                      <tr key={item._id} className={`hover:bg-slate-800/40 transition-colors ${item.status === 'IN_PROGRESS' ? 'bg-blue-950/20' : ''}`}>
                        <td className="py-4 px-4 font-mono font-black text-xs text-red-500">
                          #{item.srNo}
                          <span className="block text-[10px] text-blue-400 font-bold tracking-tight">
                            {item.appointmentId || `APT-100${item.srNo}`}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-black text-white text-sm">
                          {item.patientName}
                        </td>
                        <td className="py-4 px-4 font-bold text-emerald-400">
                          {item.doctor}<br /><span className="text-[10px] font-normal text-slate-400">{item.room}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.triage === 'EMERGENCY' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            item.triage === 'URGENT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {item.triage}
                          </span>
                        </td>

                        {/* Interactive Manual Status Selector Dropdown */}
                        <td className="py-4 px-4">
                          <select
                            value={item.status || 'WAITING'}
                            onChange={(e) => handleStatusChange(item._id, e.target.value, item.srNo)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer border focus:outline-none transition-all ${
                              item.status === 'IN_PROGRESS'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                : item.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : item.status === 'CANCELLED'
                                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                : item.status === 'NO_SHOW'
                                ? 'bg-slate-800 text-slate-400 border-slate-700'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            <option value="WAITING" className="bg-slate-900 text-amber-300 font-bold">WAITING (In Queue)</option>
                            <option value="IN_PROGRESS" className="bg-slate-900 text-blue-300 font-bold">IN_PROGRESS (In Cabin)</option>
                            <option value="COMPLETED" className="bg-slate-900 text-emerald-300 font-bold">COMPLETED (Done)</option>
                            <option value="CANCELLED" className="bg-slate-900 text-red-300 font-bold">CANCELLED</option>
                            <option value="NO_SHOW" className="bg-slate-900 text-slate-400 font-bold">NO_SHOW (Absent)</option>
                          </select>
                        </td>

                        {/* Quick Delete Patient Action */}
                        <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                          {/* Delete Patient Button */}
                          <button
                            onClick={() => handleDeletePatient(item._id, item.patientName)}
                            className="p-1.5 bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-800/40 rounded-xl transition-all"
                            title={`Delete ${item.patientName} from queue`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* MODAL 1: FILE / TEXT SCHEDULE IMPORT */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Upload className="text-emerald-400" size={20} /> Native Schedule File Import
                </h3>
                <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleScheduleTextUpload} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Select Schedule File (.csv, .txt, .pdf, .docx)</label>
                  <input 
                    type="file" 
                    accept=".csv, .txt, .pdf, .docx"
                    onChange={handleFileDrop}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-300 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Or Paste CSV / Table Lines Directly</label>
                  <textarea 
                    rows={6}
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    placeholder="Example Format:&#10;1, John Doe, Dr. Sharma, Room 101, 10:00 AM, EMERGENCY&#10;2, Anita Roy, Dr. Kumar, Room 204, 10:30 AM, URGENT"
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-950/40"
                >
                  Parse & Import Schedule Queue
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD SINGLE PATIENT */}
      <AnimatePresence>
        {showAddSingleModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Plus className="text-blue-400" size={20} /> Add Patient To Daily Queue
                </h3>
                <button onClick={() => setShowAddSingleModal(false)} className="text-slate-400 hover:text-white">
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleAddSingle} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Patient Name</label>
                  <input 
                    type="text" 
                    required
                    value={singleForm.patientName} 
                    onChange={e => setSingleForm({ ...singleForm, patientName: e.target.value })}
                    placeholder="e.g. Ramesh Patel" 
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Doctor Name</label>
                    <input 
                      type="text" 
                      value={singleForm.doctor} 
                      onChange={e => setSingleForm({ ...singleForm, doctor: e.target.value })}
                      placeholder="Dr. A. Sharma" 
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Room / Cabin</label>
                    <input 
                      type="text" 
                      value={singleForm.room} 
                      onChange={e => setSingleForm({ ...singleForm, room: e.target.value })}
                      placeholder="OPD Cabin 102" 
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Time</label>
                    <input 
                      type="text" 
                      value={singleForm.time} 
                      onChange={e => setSingleForm({ ...singleForm, time: e.target.value })}
                      placeholder="11:30 AM" 
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Triage Priority</label>
                    <select 
                      value={singleForm.triage} 
                      onChange={e => setSingleForm({ ...singleForm, triage: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-blue-500 focus:outline-none font-bold"
                    >
                      <option value="ROUTINE">ROUTINE</option>
                      <option value="URGENT">URGENT</option>
                      <option value="EMERGENCY">EMERGENCY</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-950/40"
                >
                  Add To Queue List
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

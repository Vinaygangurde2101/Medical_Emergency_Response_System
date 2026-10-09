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
  ShieldCheck,
  Plus,
  QrCode,
  AlertTriangle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Hospital as HospitalIcon,
  PhoneCall,
  MapPin,
  Edit3,
  Server,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  fetchAdminStats, 
  fetchAdminLogs, 
  fetchAdminHospitals, 
  addAdminHospital,
  toggleAdminHospitalApproval,
  fetchAdminUsers,
  toggleAdminUserQr,
  fetchAdminBloodBanks,
  addAdminBloodBank,
  updateAdminBloodBankInventory,
  fetchAdminEmergencyNotifs
} from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [users, setUsers] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [emergencyNotifs, setEmergencyNotifs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [logFilter, setLogFilter] = useState('ALL');

  // Modals state
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showAddBloodBankModal, setShowAddBloodBankModal] = useState(false);
  const [showEditStockModal, setShowEditStockModal] = useState(false);

  // Form States
  const [hospForm, setHospForm] = useState({ name: '', licenseNumber: '', city: '', address: '', contactPhone: '', email: '' });
  const [bankForm, setBankForm] = useState({ name: '', address: '', city: '', phone: '' });
  const [stockForm, setStockForm] = useState({ bankId: '', bloodGroup: 'O+', units: 10, status: 'AVAILABLE' });

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes, hospRes, usersRes, bbRes, notifRes] = await Promise.all([
        fetchAdminStats(),
        fetchAdminLogs(),
        fetchAdminHospitals(),
        fetchAdminUsers(),
        fetchAdminBloodBanks(),
        fetchAdminEmergencyNotifs()
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data || []);
      setHospitals(hospRes.data || []);
      setUsers(usersRes.data || []);
      setBloodBanks(bbRes.data || []);
      setEmergencyNotifs(notifRes.data || []);
    } catch (err) {
      toast.error('Failed to load administrative portal data');
    } finally {
      setLoading(false);
    }
  };

  // Hospital Actions
  const handleCreateHospital = async (e) => {
    e.preventDefault();
    try {
      const res = await addAdminHospital(hospForm);
      toast.success('Hospital partner registered successfully!');
      setShowAddHospitalModal(false);
      setHospForm({ name: '', licenseNumber: '', city: '', address: '', contactPhone: '', email: '' });
      loadAllAdminData();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to add hospital');
    }
  };

  const handleToggleHospitalApproval = async (id) => {
    try {
      await toggleAdminHospitalApproval(id);
      toast.success('Hospital authorization status updated');
      loadAllAdminData();
    } catch (err) {
      toast.error('Failed to update hospital status');
    }
  };

  // User QR Actions
  const handleToggleUserQr = async (userId) => {
    try {
      const res = await toggleAdminUserQr(userId);
      toast.success(`Patient QR status updated: ${res.data.isQrActive ? 'ACTIVE' : 'SUSPENDED'}`);
      loadAllAdminData();
    } catch (err) {
      toast.error('Failed to update QR status');
    }
  };

  // Blood Bank Actions
  const handleCreateBloodBank = async (e) => {
    e.preventDefault();
    try {
      await addAdminBloodBank(bankForm);
      toast.success('Blood Bank registered successfully!');
      setShowAddBloodBankModal(false);
      setBankForm({ name: '', address: '', city: '', phone: '' });
      loadAllAdminData();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to add blood bank');
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      await updateAdminBloodBankInventory(stockForm.bankId, {
        bloodGroup: stockForm.bloodGroup,
        units: Number(stockForm.units),
        status: stockForm.status
      });
      toast.success('Inventory stock level updated');
      setShowEditStockModal(false);
      loadAllAdminData();
    } catch (err) {
      toast.error('Failed to update inventory stock');
    }
  };

  // Filtered Logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.qrId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.hospitalName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.staffName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.actionDetails || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (logFilter === 'HOSPITAL') return matchesSearch && log.accessType === 'VERIFIED_HOSPITAL_ACCESS';
    if (logFilter === 'PUBLIC') return matchesSearch && log.accessType === 'PUBLIC_RESPONDER';
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white pb-16">
      {/* Executive Navbar */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-10 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-lg shadow-red-600/30">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg sm:text-xl text-white tracking-tight leading-none">MERS Control Portal</h1>
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                System Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
              <Server size={12} className="text-emerald-400" /> System Status: <span className="text-emerald-400 font-bold">{stats?.systemStatus || 'OPERATIONAL'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadAllAdminData} 
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-all active:scale-95"
            title="Refresh System Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          <button 
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-red-950/40"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Exit Control Panel</span>
          </button>
        </div>
      </header>

      {/* Main Executive Body */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-slate-900 to-slate-900/80 p-5 sm:p-6 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            <div className="flex items-center justify-between text-blue-400 mb-3">
              <Users size={24} />
              <span className="text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">REGISTRY</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white">{stats?.totalPatients || 0}</div>
            <p className="text-xs text-slate-400 font-semibold mt-1">Registered Patients</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-slate-900 to-slate-900/80 p-5 sm:p-6 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center justify-between text-emerald-400 mb-3">
              <Building2 size={24} />
              <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">HOSPITALS</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white">{stats?.totalHospitals || 0}</div>
            <p className="text-xs text-slate-400 font-semibold mt-1">{stats?.approvedHospitals || 0} Authorized & Active</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-slate-900 to-slate-900/80 p-5 sm:p-6 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
            <div className="flex items-center justify-between text-purple-400 mb-3">
              <FileText size={24} />
              <span className="text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">AUDIT LOGS</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white">{stats?.totalAccessLogs || 0}</div>
            <p className="text-xs text-slate-400 font-semibold mt-1">Audit Trail Records</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-slate-900 to-slate-900/80 p-5 sm:p-6 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
            <div className="flex items-center justify-between text-red-400 mb-3">
              <Bell size={24} />
              <span className="text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">EMERGENCY</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white">{stats?.totalEmergencyNotifs || 0}</div>
            <p className="text-xs text-slate-400 font-semibold mt-1">Triggers & Dispatches</p>
          </motion.div>
        </div>

        {/* Executive Section Navigation Tabs */}
        <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar gap-2 sm:gap-6 pt-2">
          {[
            { id: 'overview', label: 'Overview & Ticker', icon: Activity },
            { id: 'logs', label: `Audit Trails (${logs.length})`, icon: ShieldCheck },
            { id: 'hospitals', label: `Hospitals (${hospitals.length})`, icon: Building2 },
            { id: 'users', label: `Patients & QR (${users.length})`, icon: Users },
            { id: 'bloodBanks', label: `Blood Inventory (${bloodBanks.length})`, icon: Droplet },
            { id: 'notifs', label: `Emergency Alerts (${emergencyNotifs.length})`, icon: Bell }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-3 font-bold text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 transition-all border-b-2 ${
                  isActive 
                    ? 'border-red-500 text-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.3)]' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Quick Actions Panel */}
              <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-6 shadow-xl space-y-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Layers size={18} className="text-red-500" /> Executive Controls
                </h3>

                <div className="space-y-3">
                  <button 
                    onClick={() => setShowAddHospitalModal(true)}
                    className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border border-slate-700 font-bold text-xs flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 size={16} className="text-emerald-400" /> Register Partner Hospital
                    </span>
                    <Plus size={16} />
                  </button>

                  <button 
                    onClick={() => setShowAddBloodBankModal(true)}
                    className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border border-slate-700 font-bold text-xs flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Droplet size={16} className="text-red-400" /> Register Blood Center
                    </span>
                    <Plus size={16} />
                  </button>

                  <button 
                    onClick={() => setShowEditStockModal(true)}
                    className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border border-slate-700 font-bold text-xs flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Edit3 size={16} className="text-amber-400" /> Manage Blood Stock
                    </span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Live Security Feed */}
              <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] border border-slate-800 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Activity size={18} className="text-emerald-400" /> Live Audit Stream Ticker
                  </h3>
                  <button 
                    onClick={() => setActiveTab('logs')} 
                    className="text-xs font-bold text-slate-400 hover:text-red-400 flex items-center gap-1"
                  >
                    View All Logs <ChevronRight size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  {logs.slice(0, 4).map((log, i) => (
                    <div key={log._id || i} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                          log.accessType === 'VERIFIED_HOSPITAL_ACCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {log.accessType === 'VERIFIED_HOSPITAL_ACCESS' ? <Building2 size={16} /> : <QrCode size={16} />}
                        </div>
                        <div>
                          <p className="font-bold text-white">{log.staffName || 'Anonymous Access'}</p>
                          <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                            Token: <span className="text-blue-400 font-bold">{log.qrId}</span> • {log.actionDetails}
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[10px] text-slate-500">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ACCESS AUDIT TRAILS */}
        {activeTab === 'logs' && (
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <ShieldCheck size={20} className="text-red-500" /> Security Access Audit Logs
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Real-time audit trailing of all emergency QR scans and hospital lookup events.</p>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold gap-1">
                {['ALL', 'HOSPITAL', 'PUBLIC'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setLogFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      logFilter === filter ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs by QR token, hospital, staff name, or IP address..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Audit Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-black tracking-widest text-[10px]">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">QR Token</th>
                    <th className="py-3.5 px-4">Access Type</th>
                    <th className="py-3.5 px-4">Hospital / Staff</th>
                    <th className="py-3.5 px-4">IP Address</th>
                    <th className="py-3.5 px-4">Action Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                  {filteredLogs.map((log, idx) => (
                    <tr key={log._id || idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-mono text-slate-400 text-[11px]">
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
                      <td className="py-4 px-4 font-mono text-slate-400">
                        {log.ipAddress || '127.0.0.1'}
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

        {/* TAB 3: HEALTHCARE NETWORK MANAGEMENT */}
        {activeTab === 'hospitals' && (
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Building2 size={20} className="text-emerald-400" /> Authorized Healthcare Network
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Manage hospital registrations and authorization licenses.</p>
              </div>

              <button 
                onClick={() => setShowAddHospitalModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
              >
                <Plus size={16} /> Register New Hospital
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hospitals.map(hosp => (
                <div key={hosp._id} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-white text-base flex items-center gap-2">
                        {hosp.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">License: <span className="text-slate-200 font-bold">{hosp.licenseNumber}</span></p>
                    </div>

                    <button 
                      onClick={() => handleToggleHospitalApproval(hosp._id)}
                      className={`px-3.5 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                        hosp.isApproved 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 shadow-lg shadow-amber-950/30'
                      }`}
                      title={hosp.isApproved ? "Click to Revoke Authorization" : "Click to Grant Admin Verification & Approval"}
                    >
                      {hosp.isApproved ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                      {hosp.isApproved ? 'VERIFIED & AUTHORIZED' : 'GRANT APPROVAL (PENDING)'}
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 font-medium">
                    <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-500" /> {hosp.address}, {hosp.city}</p>
                    <p className="flex items-center gap-2"><PhoneCall size={14} className="text-slate-500" /> {hosp.contactPhone} • {hosp.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PATIENTS & QR REGISTRY */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Users size={20} className="text-blue-400" /> Registered Patient Profiles & QR Registry
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">View patient security status and toggle QR tag activation state.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-black tracking-widest text-[10px]">
                    <th className="py-3.5 px-4">Patient Name</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">QR Token ID</th>
                    <th className="py-3.5 px-4">Blood Group</th>
                    <th className="py-3.5 px-4">Total Scans</th>
                    <th className="py-3.5 px-4">QR Security Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                  {users.map((user, idx) => (
                    <tr key={user._id || idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-black text-white text-sm">
                        {user.name}
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                        {user.email}<br />{user.phone}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-blue-400">
                        {user.qrId}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-red-400 font-black border border-slate-700">
                          {user.bloodGroup || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-slate-300">
                        {user.scansCount} Scans
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          user.isQrActive 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {user.isQrActive ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => handleToggleUserQr(user._id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            user.isQrActive 
                              ? 'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30' 
                              : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30'
                          }`}
                        >
                          {user.isQrActive ? 'Disable QR Tag' : 'Enable QR Tag'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: BLOOD BANK INVENTORY MANAGER */}
        {activeTab === 'bloodBanks' && (
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Droplet size={20} className="text-red-500" /> Blood Bank Inventory Network
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Monitor real-time blood stock levels across city centers.</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setShowAddBloodBankModal(true)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-red-950/40 transition-all"
                >
                  <Plus size={16} /> Add Blood Center
                </button>
                <button 
                  onClick={() => setShowEditStockModal(true)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all"
                >
                  <Edit3 size={16} /> Update Stock
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {bloodBanks.map(bank => (
                <div key={bank._id} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-white text-base">{bank.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{bank.address}, {bank.city} • <span className="text-slate-300 font-mono">{bank.phone}</span></p>
                    </div>
                  </div>

                  {/* Stock Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
                    {bank.inventory?.map(item => (
                      <div 
                        key={item.bloodGroup}
                        className={`p-3 rounded-2xl border text-center space-y-1 ${
                          item.status === 'AVAILABLE' ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' :
                          item.status === 'CRITICAL' ? 'bg-amber-950/30 border-amber-800/50 text-amber-300' :
                          'bg-red-950/30 border-red-800/50 text-red-400'
                        }`}
                      >
                        <div className="font-black text-sm">{item.bloodGroup}</div>
                        <div className="text-xl font-black">{item.units} <span className="text-[10px] font-normal text-slate-400">units</span></div>
                        <div className="text-[9px] font-extrabold uppercase tracking-wider">{item.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: EMERGENCY DISPATCH LOGS */}
        {activeTab === 'notifs' && (
          <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Bell size={20} className="text-amber-400" /> Emergency Family Alert Dispatch Logs
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Log of emergency intermediary notifications dispatched to family contacts.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-black tracking-widest text-[10px]">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Patient Name</th>
                    <th className="py-3.5 px-4">Contact Person</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Dispatch Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                  {emergencyNotifs.map((notif, idx) => (
                    <tr key={notif._id || idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-mono text-slate-400 text-[11px]">
                        {new Date(notif.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-black text-white">
                        {notif.patientName}
                      </td>
                      <td className="py-4 px-4 text-slate-300 font-bold">
                        {notif.contactName} ({notif.contactPhone})
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-mono">
                        {notif.location?.address || 'Geolocation Available'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {notif.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: REGISTER HOSPITAL */}
      <AnimatePresence>
        {showAddHospitalModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Building2 className="text-emerald-400" size={20} /> Register Partner Hospital
                </h3>
                <button onClick={() => setShowAddHospitalModal(false)} className="text-slate-400 hover:text-white">
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateHospital} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Hospital Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={hospForm.name} 
                    onChange={e => setHospForm({ ...hospForm, name: e.target.value })}
                    placeholder="e.g. City Care Specialty Hospital" 
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">License Number</label>
                    <input 
                      type="text" 
                      required 
                      value={hospForm.licenseNumber} 
                      onChange={e => setHospForm({ ...hospForm, licenseNumber: e.target.value })}
                      placeholder="HOSP-MUM-1002" 
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">City</label>
                    <input 
                      type="text" 
                      required 
                      value={hospForm.city} 
                      onChange={e => setHospForm({ ...hospForm, city: e.target.value })}
                      placeholder="Mumbai" 
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Full Address</label>
                  <input 
                    type="text" 
                    required 
                    value={hospForm.address} 
                    onChange={e => setHospForm({ ...hospForm, address: e.target.value })}
                    placeholder="100 Hospital Road, Sector 5" 
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Contact Phone</label>
                    <input 
                      type="text" 
                      required 
                      value={hospForm.contactPhone} 
                      onChange={e => setHospForm({ ...hospForm, contactPhone: e.target.value })}
                      placeholder="+91 22 2000 1111" 
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Official Email</label>
                    <input 
                      type="email" 
                      required 
                      value={hospForm.email} 
                      onChange={e => setHospForm({ ...hospForm, email: e.target.value })}
                      placeholder="info@hospital.org" 
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-950/40"
                >
                  Confirm & Register Partner Hospital
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: REGISTER BLOOD BANK */}
      <AnimatePresence>
        {showAddBloodBankModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Droplet className="text-red-400" size={20} /> Register Blood Bank Center
                </h3>
                <button onClick={() => setShowAddBloodBankModal(false)} className="text-slate-400 hover:text-white">
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateBloodBank} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Blood Center Name</label>
                  <input 
                    type="text" 
                    required 
                    value={bankForm.name} 
                    onChange={e => setBankForm({ ...bankForm, name: e.target.value })}
                    placeholder="e.g. LifeLine Regional Blood Storage" 
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Address</label>
                  <input 
                    type="text" 
                    required 
                    value={bankForm.address} 
                    onChange={e => setBankForm({ ...bankForm, address: e.target.value })}
                    placeholder="Central Medical Complex" 
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">City</label>
                    <input 
                      type="text" 
                      required 
                      value={bankForm.city} 
                      onChange={e => setBankForm({ ...bankForm, city: e.target.value })}
                      placeholder="Mumbai" 
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Contact Phone</label>
                    <input 
                      type="text" 
                      required 
                      value={bankForm.phone} 
                      onChange={e => setBankForm({ ...bankForm, phone: e.target.value })}
                      placeholder="+91 22 2500 9900" 
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-950/40"
                >
                  Add Blood Center to Network
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: UPDATE BLOOD STOCK */}
      <AnimatePresence>
        {showEditStockModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Edit3 className="text-amber-400" size={20} /> Update Blood Inventory Stock
                </h3>
                <button onClick={() => setShowEditStockModal(false)} className="text-slate-400 hover:text-white">
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateStock} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Select Blood Center</label>
                  <select 
                    required 
                    value={stockForm.bankId} 
                    onChange={e => setStockForm({ ...stockForm, bankId: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Choose Center --</option>
                    {bloodBanks.map(b => (
                      <option key={b._id} value={b._id}>{b.name} ({b.city})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Blood Group</label>
                    <select 
                      value={stockForm.bloodGroup} 
                      onChange={e => setStockForm({ ...stockForm, bloodGroup: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-amber-500 focus:outline-none font-bold"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Available Units</label>
                    <input 
                      type="number" 
                      min="0"
                      required 
                      value={stockForm.units} 
                      onChange={e => setStockForm({ ...stockForm, units: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Stock Status</label>
                    <select 
                      value={stockForm.status} 
                      onChange={e => setStockForm({ ...stockForm, status: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:border-amber-500 focus:outline-none font-bold text-[10px]"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-amber-950/40"
                >
                  Save & Update Inventory Stock
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplet, MapPin, Phone, Search, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { fetchBloodBanks } from '../services/api';
import { toast } from 'react-hot-toast';

export default function BloodBankModal({ isOpen, onClose, initialBloodGroup = 'O+' }) {
  const [selectedGroup, setSelectedGroup] = useState(initialBloodGroup);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadBloodBanks();
    }
  }, [isOpen, selectedGroup]);

  const loadBloodBanks = async () => {
    setLoading(true);
    try {
      const res = await fetchBloodBanks(selectedGroup);
      setBloodBanks(res.data.data || []);
    } catch (err) {
      toast.error('Unable to fetch blood bank inventory');
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          toast.success('Location updated for distance calculation');
        },
        () => toast.error('Geolocation permission denied')
      );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] flex flex-col shadow-2xl border border-gray-100"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <Droplet size={26} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Blood Bank Finder</h2>
                <p className="text-xs font-semibold text-gray-400">Emergency Inventory Search</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Blood Group Selector */}
          <div className="py-6 border-b border-gray-100">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Filter Blood Group</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <button
                  key={bg}
                  onClick={() => setSelectedGroup(bg)}
                  className={`py-2.5 rounded-xl font-extrabold text-sm transition-all border-2
                    ${selectedGroup === bg 
                      ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20' 
                      : 'bg-gray-50 text-gray-700 border-gray-100 hover:border-red-200'}
                  `}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Location Request Bar */}
          <div className="py-3 flex items-center justify-between bg-red-50/60 rounded-2xl px-4 my-4">
            <div className="flex items-center gap-2 text-xs font-bold text-red-700">
              <MapPin size={16} />
              <span>{location ? 'Nearby location detected' : 'Enable GPS for accurate distance'}</span>
            </div>
            <button 
              onClick={requestLocation}
              className="text-xs font-black text-red-600 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-red-100 hover:bg-red-600 hover:text-white transition-all"
            >
              {location ? 'Refreshed' : 'Use My GPS'}
            </button>
          </div>

          {/* Blood Banks List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {loading ? (
              <div className="py-12 text-center text-gray-400 font-bold animate-pulse">
                Searching blood banks & emergency inventories...
              </div>
            ) : bloodBanks.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                No blood banks found with group {selectedGroup}
              </div>
            ) : (
              bloodBanks.map(bank => (
                <div key={bank.id || bank._id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-extrabold text-gray-900 text-base">{bank.name}</h3>
                      {bank.isDemoData && (
                        <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase">Demo Data</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                      {bank.address}, {bank.city} {bank.distanceKm ? `(${bank.distanceKm} km away)` : ''}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-gray-700 bg-white border border-gray-200 px-3 py-1 rounded-xl">
                        Group {selectedGroup}: <strong className="text-red-600">{bank.requestedUnits ?? 'Available'} units</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col justify-between items-end gap-2">
                    <button
                      onClick={() => window.open(`tel:${bank.phone}`)}
                      className="w-full sm:w-auto px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                    >
                      <Phone size={14} /> Call Bank
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

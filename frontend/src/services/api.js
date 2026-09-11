import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const API = axios.create({ 
  baseURL: API_BASE_URL 
});

// Add token to headers if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token') || localStorage.getItem('hospital_token');
  if (token) {
    req.headers['x-auth-token'] = token;
    req.headers['Authorization'] = `Bearer ${token}`;
  }
  return req;
});

// Auth Services
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const fetchMe = () => API.get('/auth/me');

// Patient Services
export const fetchSummary = () => API.get('/patient/summary');
export const updateProfile = (data) => API.put('/patient/update', data);

// Public Emergency Services (Minimum Data Exposure)
export const fetchEmergencyInfo = (qrId) => API.get(`/emergency/${qrId}`);
export const triggerFamilyContact = (data) => API.post('/emergency/contact-family', data);

// Verified Hospital Services
export const hospitalLogin = (data) => API.post('/hospital/login', data);
export const fetchVerifiedHospitalProfile = (qrId) => API.get(`/hospital/patient-profile/${qrId}`);

// Blood Bank Finder
export const fetchBloodBanks = (bloodGroup, lat, lng) => API.get('/blood-banks', { params: { bloodGroup, lat, lng } });

// AI Services
export const sendAIChat = (query) => API.post('/ai/chat', { query });
export const analyzeReport = (formData) => API.post('/analyze', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Admin Services
export const fetchAdminStats = () => API.get('/admin/stats');
export const fetchAdminLogs = () => API.get('/admin/access-logs');
export const fetchAdminHospitals = () => API.get('/admin/hospitals');

export default API;

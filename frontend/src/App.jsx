import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import HospitalLogin from './pages/HospitalLogin';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/dashboard/Profile';
import ReportAnalyzer from './pages/dashboard/ReportAnalyzer';
import EmergencyView from './pages/EmergencyView';
import AIAssistant from './components/AIAssistant';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Loader from './components/Loader';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white">
      <Loader size="lg" />
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return null;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/admin-login" />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white">
      <Loader size="lg" />
    </div>
  );
  
  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" />;
    if (user.role === 'HOSPITAL_STAFF') return <Navigate to="/hospital" />;
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <>
      <Toaster position="top-right" />
      <AIAssistant />
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Dedicated Separate Login Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/patient-login" element={<PublicRoute><Login /></PublicRoute>} />
        
        <Route path="/hospital-login" element={<PublicRoute><HospitalLogin /></PublicRoute>} />
        <Route path="/hospital/login" element={<PublicRoute><HospitalLogin /></PublicRoute>} />
        
        <Route path="/admin-login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
        <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />

        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/analyzer" element={
          <ProtectedRoute>
            <ReportAnalyzer />
          </ProtectedRoute>
        } />
        <Route path="/e/:qrId" element={<EmergencyView />} />
        <Route path="/hospital" element={<HospitalDashboard />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/dashboard/Profile';
import ReportAnalyzer from './pages/dashboard/ReportAnalyzer';
import EmergencyView from './pages/EmergencyView';
import AIAssistant from './components/AIAssistant';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return null;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/dashboard" />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  );
  
  if (user) return <Navigate to="/dashboard" />;
  
  return children;
};

function AppRoutes() {
  return (
    <>
      <Toaster position="top-right" />
      <AIAssistant />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
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

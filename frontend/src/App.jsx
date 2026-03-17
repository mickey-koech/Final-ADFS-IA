import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './features/auth/Login';
import Layout from './components/Layout';
import FileExplorer from './features/files/FileExplorer';
import AnalyticsDashboard from './features/files/AnalyticsDashboard';
import AdminDashboard from './features/admin/AdminDashboard';

function PrivateRoute({ children, auth }) {
  return auth ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setAuth(true);
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '500', borderRadius: '12px', padding: '12px 16px' },
          success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
          error: { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
        }}
      />
      <Router>
        <Routes>
          <Route path="/login" element={auth ? <Navigate to="/" replace /> : <Login setAuth={setAuth} />} />
          <Route path="/" element={<PrivateRoute auth={auth}><Layout setAuth={setAuth} /></PrivateRoute>}>
            <Route index element={<FileExplorer />} />
            <Route path="tasks" element={<AnalyticsDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}


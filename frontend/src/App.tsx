import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from "@/components/ui/toaster"
import { Layout } from './components/pages/user/Layout'
import { AdminLayout } from './components/pages/admin/AdminLayout'
import LoginPage from './components/pages/LoginPage'
import RegisterPage from './components/pages/RegisterPage'
import UserDashboard from './components/pages/user/UserDashboard'
import AdminDashboard from './components/pages/admin/AdminDashboard'
import ClearanceRequestForm from './components/pages/user/ClearanceRequestForm'
import RequestList from './components/pages/user/RequestList'
import RequestDetail from './components/pages/user/RequestDetail'
import AdminReview from './components/pages/admin/AdminReview'
import UserList from './components/pages/user/UserList'
import AdminRequestList from './components/pages/admin/AdminRequestList'
import UserRequestsDetail from './components/pages/user/UserRequestsDetail'

const queryClient = new QueryClient()

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

function AppContent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      if (token) {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        if (tokenData.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
      setIsLoading(false);
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* User routes */}
      <Route path="/" element={<PrivateRoute><Layout><UserDashboard /></Layout></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Layout><UserDashboard /></Layout></PrivateRoute>} />
      <Route path="/request" element={<PrivateRoute><Layout><ClearanceRequestForm /></Layout></PrivateRoute>} />
      <Route path="/requests" element={<PrivateRoute><Layout><RequestList /></Layout></PrivateRoute>} />
      <Route path="/requests/:id" element={<PrivateRoute><Layout><RequestDetail /></Layout></PrivateRoute>} />
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/requests" element={<AdminRoute><AdminLayout><AdminRequestList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/user-requests/:userId" element={<AdminRoute><AdminLayout><UserRequestsDetail /></AdminLayout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminLayout><UserList /></AdminLayout></AdminRoute>} />
      <Route path="/admin/review/:id" element={<AdminRoute><AdminLayout><AdminReview /></AdminLayout></AdminRoute>} />
    </Routes>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default App;
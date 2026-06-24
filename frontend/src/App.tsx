import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Market } from './pages/Market';
import { ProductDetails } from './pages/ProductDetails';
import { Wallet } from './pages/Wallet';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { ForgotPassword } from './pages/ForgotPassword';
import { Account } from './pages/Account';
import { MyListings } from './pages/MyListings';
import { Orders } from './pages/Orders';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { AuthModal } from './components/AuthModal';

/* ── Protected route: redirects guests to /login ── */
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return element;
};

/* ── Guest-only route: redirects authenticated users away ── */
const GuestRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : element;
};

/* ── Inner shell that has access to auth state ── */
function AppShell() {
  const { isAuthenticated } = useAuth();

  return (
    <AuthModalProvider isAuthenticated={isAuthenticated}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/market" element={<Market />} />
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* Auth pages (redirect away if already logged in) */}
        <Route path="/login" element={<GuestRoute element={<Login />} />} />
        <Route path="/signup" element={<GuestRoute element={<SignUp />} />} />
        <Route path="/forgot-password" element={<GuestRoute element={<ForgotPassword />} />} />

        {/* Protected routes */}
        <Route path="/wallet" element={<ProtectedRoute element={<Wallet />} />} />
        <Route path="/account" element={<ProtectedRoute element={<Account />} />} />
        <Route path="/listings" element={<ProtectedRoute element={<MyListings />} />} />
        <Route path="/orders" element={<ProtectedRoute element={<Orders />} />} />
      </Routes>

      {/* Global auth modal rendered once */}
      <AuthModal />
    </AuthModalProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </Router>
  );
}

export default App;

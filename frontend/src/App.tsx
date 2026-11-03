import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

const Home = lazy(() => import('./pages/Home'));
const Market = lazy(() => import('./pages/Market'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const ExchangeDetail = lazy(() => import('./pages/ExchangeDetail'));
const Wallet = lazy(() => import('./pages/Wallet'));
const MyListings = lazy(() => import('./pages/MyListings'));
const ListingForm = lazy(() => import('./pages/ListingForm'));
const Saved = lazy(() => import('./pages/Saved'));
const Account = lazy(() => import('./pages/Account'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Help = lazy(() => import('./pages/Help'));
const Legal = lazy(() => import('./pages/Legal'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLayout = lazy(() => import('./pages/admin/shared').then((m) => ({ default: m.AdminLayout })));
const adminPage = (name: 'AdminOverview' | 'AdminReports' | 'AdminListings' | 'AdminMembers' | 'AdminMemberDetail' | 'AdminExchanges' | 'AdminAudit') =>
  lazy(() => import('./pages/admin/AdminPages').then((m) => ({ default: m[name] })));
const AdminOverview = adminPage('AdminOverview');
const AdminReports = adminPage('AdminReports');
const AdminListings = adminPage('AdminListings');
const AdminMembers = adminPage('AdminMembers');
const AdminMemberDetail = adminPage('AdminMemberDetail');
const AdminExchanges = adminPage('AdminExchanges');
const AdminAudit = adminPage('AdminAudit');

const FullPageSpinner: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Loader2 className="animate-spin text-primary" size={28} aria-label="Loading" />
  </div>
);

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }
  return element;
};

const GuestRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;
  if (isAuthenticated) {
    // Runs the moment login succeeds, so it must honour the page they came from.
    const from = (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={from} replace />;
  }
  return element;
};

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function AppShell() {
  const { isAuthenticated } = useAuth();

  return (
    <AuthModalProvider isAuthenticated={isAuthenticated}>
      <ScrollToTop />
      <Suspense fallback={<FullPageSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/market" element={<Market />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/help" element={<Help />} />
          <Route path="/terms" element={<Legal page="terms" />} />
          <Route path="/privacy" element={<Legal page="privacy" />} />

          <Route path="/login" element={<GuestRoute element={<Login />} />} />
          <Route path="/signup" element={<GuestRoute element={<SignUp />} />} />
          <Route path="/forgot-password" element={<GuestRoute element={<ForgotPassword />} />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/wallet" element={<ProtectedRoute element={<Wallet />} />} />
          <Route path="/account" element={<ProtectedRoute element={<Account />} />} />
          <Route path="/saved" element={<ProtectedRoute element={<Saved />} />} />
          <Route path="/listings" element={<ProtectedRoute element={<MyListings />} />} />
          <Route path="/listings/:id/edit" element={<ProtectedRoute element={<ListingForm />} />} />
          <Route path="/add-item" element={<ProtectedRoute element={<ListingForm />} />} />
          <Route path="/orders" element={<ProtectedRoute element={<Orders />} />} />
          <Route path="/orders/:id" element={<ProtectedRoute element={<ExchangeDetail />} />} />
          <Route path="/checkout/:id" element={<ProtectedRoute element={<Checkout />} />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="members/:id" element={<AdminMemberDetail />} />
            <Route path="exchanges" element={<AdminExchanges />} />
            <Route path="audit" element={<AdminAudit />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <AuthModal />
    </AuthModalProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
    </ErrorBoundary>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { MenuPage } from './pages/MenuPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentFormPage } from './pages/PaymentFormPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentFailurePage } from './pages/PaymentFailurePage';
import { InvoicePage } from './pages/InvoicePage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenuPage from './pages/admin/AdminMenuPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPageNew';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSpecialsPage from './pages/admin/AdminSpecialsPage';
import AdminOffersPage from './pages/admin/AdminOffersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import MexicanBackground from './components/layout/MexicanBackground';
import ProtectedRoute from './components/admin/ProtectedRoute';

function App() {
  return (
    <BrowserRouter
      basename="/restaurantqrcode-frontend"
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <MexicanBackground>
        <CartProvider>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<MenuPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment" element={<PaymentFormPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-failure" element={<PaymentFailurePage />} />
            <Route path="/invoice" element={<InvoicePage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/menu" element={<ProtectedRoute><AdminMenuPage /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute><AdminOrdersPage /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute><AdminReportsPage /></ProtectedRoute>} />
            <Route path="/admin/specials" element={<ProtectedRoute><AdminSpecialsPage /></ProtectedRoute>} />
            <Route path="/admin/offers" element={<ProtectedRoute><AdminOffersPage /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminSettingsPage /></ProtectedRoute>} />
          </Routes>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </CartProvider>
      </MexicanBackground>
    </BrowserRouter>
  );
}

export default App;

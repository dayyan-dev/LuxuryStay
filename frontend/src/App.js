// App.js
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './Context/AuthContext';

// Layouts (small, load immediately)
import AdminLayout from './Layouts/AdminLayout';
import UserLayout from './Layouts/UserLayout';

// Auth (load immediately — first thing many users see)
import Login from './Component/Admin/login';

// ============================================================
// Admin pages — lazy loaded (only downloaded when admin visits)
// ============================================================
const Dashboard = lazy(() => import('./Component/Admin/Dashboard'));
const Rooms = lazy(() => import('./Component/Admin/rooms'));
const Bookings = lazy(() => import('./Component/Admin/bookings'));
const BookingNew = lazy(() => import('./Component/Admin/BookingNew'));
const CheckinCheckout = lazy(() => import('./Component/Admin/CheckinCheckout'));
const Users = lazy(() => import('./Component/Admin/users'));
const Staff = lazy(() => import('./Component/Admin/staff'));
const Payments = lazy(() => import('./Component/Admin/payments'));
const Housekeeping = lazy(() => import('./Component/Admin/housekeeping'));
const Maintenance = lazy(() => import('./Component/Admin/Maintenance'));
const Feedback = lazy(() => import('./Component/Admin/Feedback'));
const Reports = lazy(() => import('./Component/Admin/Reports'));
const Settings = lazy(() => import('./Component/Admin/Settings'));
const RestaurantMenu = lazy(() => import('./Component/Admin/RestaurantMenu'));
const RestaurantOrders = lazy(() => import('./Component/Admin/RestaurantOrders'));
const Services = lazy(() => import('./Component/Admin/Services'));
const FAQs = lazy(() => import('./Component/Admin/FAQs'));
const HotelServices = lazy(() => import('./Component/Admin/HotelServices'));
const AboutUs = lazy(() => import('./Component/Admin/AboutUs'));
const PricingRules = lazy(() => import('./Component/Admin/PricingRules'));
const GuestCRM = lazy(() => import('./Component/Admin/GuestCRM'));
const AuditLogs = lazy(() => import('./Component/Admin/AuditLogs'));

// ============================================================
// User pages — lazy loaded (only downloaded when a guest visits)
// ============================================================
const Home = lazy(() => import('./Component/User/Home/Home'));
const About = lazy(() => import('./Component/User/Home/About'));
const RoomsPage = lazy(() => import('./Component/User/Home/RoomsPage'));
const RestaurantPage = lazy(() => import('./Component/User/Home/RestaurantPage'));
const Faq = lazy(() => import('./Component/User/Home/Faq'));
const ContactUs = lazy(() => import('./Component/User/Home/ContactUs'));
const RoomDetailsPage = lazy(() => import('./Component/User/Home/RoomDetailsPage'));
const BookingPage = lazy(() => import('./Component/User/Home/sections/Booking'));
const UserLogin = lazy(() => import('./Component/User/Home/UserLogin'));
const Register = lazy(() => import('./Component/User/Home/Register'));
const QRScanner = lazy(() => import('./Component/User/Home/QRScanner'));
const ProfilePage = lazy(() => import('./Component/User/Home/ProfilePage'));
const ServicesPage = lazy(() => import('./Component/User/Home/ServicesPage'));
const HotelListPage = lazy(() => import('./Component/User/Hotels/HotelListPage'));
const HotelDetailPage = lazy(() => import('./Component/User/Hotels/HotelDetailPage'));
const OffersPage = lazy(() => import('./Component/User/Offers/OffersPage'));

// ============================================================
// Loading fallback shown while a lazy chunk downloads
// ============================================================
function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        height: '100vh',
        background: 'var(--theme-bg-primary, #F8FAFC)',
      }}
    >
      <div className="ls-loader" />
      <p style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: '1.15rem',
        color: 'var(--theme-text-dark, #0F172A)',
        margin: 0,
        letterSpacing: '0.04em',
      }}>
        Luxury<span style={{ color: 'var(--theme-primary, #1B365D)' }}>Stay</span>
      </p>
    </div>
  );
}

function RoleBasedRedirect() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role;
  if (role === 'admin' || role === 'manager')   return <Navigate to="/admin/dashboard"         replace />;
  if (role === 'receptionist')                  return <Navigate to="/admin/bookings"          replace />;
  if (role === 'housekeeping')                  return <Navigate to="/admin/housekeeping"      replace />;
  if (role === 'maintenance')                   return <Navigate to="/admin/maintenance"       replace />;
  if (role === 'kitchen')                       return <Navigate to="/admin/restaurant-orders" replace />;
  return <Navigate to="/admin/login" replace />;
}

function RoleRoute({ roles, children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!roles.includes(user.role)) return <RoleBasedRedirect />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Root irect */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Admin / Staff login (both /login and /admin/login supported) */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<Login />} />

            {/* User Auth routes */}
            <Route path="/user-login" element={<UserLogin />} />
            <Route path="/register" element={<Register />} />

            {/* User routes */}
            <Route path="/" element={<UserLayout />}>
              <Route path="home" element={<Home />} />
              <Route path="hotels" element={<HotelListPage />} />
              <Route path="hotels/:id" element={<HotelDetailPage />} />
              <Route path="offers" element={<OffersPage />} />
              <Route path="about" element={<About />} />
              <Route path="room" element={<RoomsPage />} />
              <Route path="restaurant" element={<RestaurantPage />} />
              <Route path="contact" element={<ContactUs />} />
              <Route path="faq" element={<Faq />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="roomsdetails/:id" element={<RoomDetailsPage />} />
              <Route path="booking/:roomId" element={<BookingPage />} />
              <Route path="/qr-checkin" element={<QRScanner />} />

              {/* ✅ Profile Route */}
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Admin routes — RoleRoute mirrors sidebar permissions */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<RoleBasedRedirect />} />
              <Route path="dashboard" element={<RoleRoute roles={['admin','manager']}><Dashboard /></RoleRoute>} />
              <Route path="rooms" element={<RoleRoute roles={['admin','manager','receptionist']}><Rooms /></RoleRoute>} />
              <Route path="bookings" element={<RoleRoute roles={['admin','manager','receptionist']}><Bookings /></RoleRoute>} />
              <Route path="booking-new" element={<RoleRoute roles={['admin','manager','receptionist']}><BookingNew /></RoleRoute>} />
              <Route path="checkin-checkout" element={<RoleRoute roles={['admin','manager','receptionist']}><CheckinCheckout /></RoleRoute>} />
              <Route path="users" element={<RoleRoute roles={['admin']}><Users /></RoleRoute>} />
              <Route path="staff" element={<RoleRoute roles={['admin']}><Staff /></RoleRoute>} />
              <Route path="payments" element={<RoleRoute roles={['admin','manager']}><Payments /></RoleRoute>} />
              <Route path="housekeeping" element={<RoleRoute roles={['admin','manager','housekeeping']}><Housekeeping /></RoleRoute>} />
              <Route path="maintenance" element={<RoleRoute roles={['admin','manager','maintenance']}><Maintenance /></RoleRoute>} />
              <Route path="feedback" element={<RoleRoute roles={['admin','manager']}><Feedback /></RoleRoute>} />
              <Route path="reports" element={<RoleRoute roles={['admin','manager']}><Reports /></RoleRoute>} />
              <Route path="settings" element={<RoleRoute roles={['admin']}><Settings /></RoleRoute>} />
              <Route path="restaurant-menu" element={<RoleRoute roles={['admin','manager','kitchen']}><RestaurantMenu /></RoleRoute>} />
              <Route path="restaurant-orders" element={<RoleRoute roles={['admin','manager','receptionist','kitchen']}><RestaurantOrders /></RoleRoute>} />
              <Route path="services" element={<RoleRoute roles={['admin','manager','receptionist']}><Services /></RoleRoute>} />
              <Route path="faqs" element={<RoleRoute roles={['admin','manager']}><FAQs /></RoleRoute>} />
              <Route path="hotel-services" element={<RoleRoute roles={['admin','manager']}><HotelServices /></RoleRoute>} />
              <Route path="about-us" element={<RoleRoute roles={['admin','manager']}><AboutUs /></RoleRoute>} />
              <Route path="pricing" element={<RoleRoute roles={['admin','manager']}><PricingRules /></RoleRoute>} />
              <Route path="guest-crm" element={<RoleRoute roles={['admin','manager']}><GuestCRM /></RoleRoute>} />
              <Route path="audit-logs" element={<RoleRoute roles={['admin','manager']}><AuditLogs /></RoleRoute>} />
            </Route>

            {/* Guest aliases for old/wrong template URLs (otherwise catch-all → /home) */}
            <Route path="/rooms" element={<Navigate to="/room" replace />} />
            <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
            <Route path="/amenities" element={<Navigate to="/services" replace />} />
            <Route path="/spa" element={<Navigate to="/services" replace />} />
            <Route path="/banquets" element={<Navigate to="/services" replace />} />
            <Route path="/blog" element={<Navigate to="/about" replace />} />
            <Route path="/blog-single-post" element={<Navigate to="/about" replace />} />
            <Route path="/blog/:id" element={<Navigate to="/about" replace />} />
            <Route path="/feedback" element={<Navigate to="/contact" replace />} />

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
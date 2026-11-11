import { Outlet } from 'react-router-dom';
import Navbar from '../Component/User/Layout/Navbar';
import Footer from '../Component/User/Layout/Footer';
import BackToTop from '../Component/User/Layout/BackToTop';
import LuxuryStayChatbot from '../Component/User/Chatbot/LuxuryStayChatbot';
import ThemePanel from '../Component/Admin/ThemePanel';

export default function UserLayout() {
  return (
    <div className="user-app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main className="user-main" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
      <LuxuryStayChatbot />
      <ThemePanel />
    </div>
  );
}

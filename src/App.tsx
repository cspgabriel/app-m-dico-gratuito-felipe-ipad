import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { FirebaseProvider, useAuth } from './components/FirebaseProvider';
import { 
  Users, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  LogOut, 
  PlusCircle, 
  Search,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { Button } from './components/ui/button';
import { ScrollArea } from './components/ui/scroll-area';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';

// Lazy load pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PatientsPage = lazy(() => import('./pages/PatientsPage'));
const ConsultationsList = lazy(() => import('./pages/ConsultationsList'));
const PatientDetails = lazy(() => import('./pages/PatientDetails'));
const ConsultationPage = lazy(() => import('./pages/ConsultationPage'));
const Settings = lazy(() => import('./pages/Settings'));

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-apple-blue text-white shadow-lg' 
          : 'text-apple-gray-dark hover:bg-black/5 hover:text-[#1C1C1E]'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
      {active && <motion.div layoutId="active-indicator" className="ml-auto"><ChevronRight size={16} /></motion.div>}
    </motion.div>
  </Link>
);

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* iPad Sidebar */}
      <aside className="ipad-sidebar flex flex-col p-6 z-10">
        <div className="flex flex-col mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-apple-blue rounded-xl flex items-center justify-center text-white shadow-blue-500/30 shadow-lg">
              <ClipboardList size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-apple-blue">MedSystem</h1>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-apple-gray-dark font-bold mt-1 ml-13">Premium Clinical Suite</p>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem 
            to="/dashboard" 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={location.pathname === '/dashboard'} 
          />
          <SidebarItem 
            to="/patients" 
            icon={Users} 
            label="Pacientes" 
            active={location.pathname === '/patients' || location.pathname.startsWith('/patients/')} 
          />
          <SidebarItem 
            to="/consultations" 
            icon={ClipboardList} 
            label="Consultas" 
            active={location.pathname === '/consultations'} 
          />
          <SidebarItem 
            to="/settings" 
            icon={SettingsIcon} 
            label="Configurações" 
            active={location.pathname === '/settings'} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/20">
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/40 flex items-center gap-3 mb-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-apple-blue to-[#5856D6] flex items-center justify-center text-white font-bold shadow-sm">
              {user.isAnonymous ? 'V' : (user.email?.[0].toUpperCase() || 'M')}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user.isAnonymous ? 'Visitante' : user.email}</p>
              <p className="text-[10px] text-apple-gray-dark font-semibold">
                {user.isAnonymous ? 'Acesso Limitado' : 'CRM 123456/SP'}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-white/50 rounded-xl"
            onClick={() => signOut(auth)}
          >
            <LogOut size={20} />
            <span>Sair</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ipad-content flex flex-col z-0">
        <ScrollArea className="flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </ScrollArea>
      </main>
    </div>
  );
};

const LandingPage = lazy(() => import('./pages/LandingPage'));

export default function App() {
  return (
    <FirebaseProvider>
      <Router>
        <Suspense fallback={<div className="flex items-center justify-center h-screen bg-apple-gray text-apple-blue font-medium">Carregando MedSystem...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/patients" element={<MainLayout><PatientsPage /></MainLayout>} />
            <Route path="/patients/:id" element={<MainLayout><PatientDetails /></MainLayout>} />
            <Route path="/consultations" element={<MainLayout><ConsultationsList /></MainLayout>} />
            <Route path="/consultation/:patientId" element={<MainLayout><ConsultationPage /></MainLayout>} />
            <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
        <Toaster position="top-right" />
      </Router>
    </FirebaseProvider>
  );
}

import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { FirebaseProvider, useAuth } from './components/FirebaseProvider';
import { 
  Users, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  LogOut, 
  PlusCircle, 
  Search,
  ChevronRight,
  ClipboardList,
  BarChart,
  Menu,
  X,
  UsersRound,
  CreditCard,
  ChevronDown,
  Receipt
} from 'lucide-react';
import { Button } from './components/ui/button';
import { ScrollArea } from './components/ui/scroll-area';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { CalendarDays } from 'lucide-react';
import PWAInstallPrompt, { PWAInstallButton } from './components/PWAInstallPrompt';

// Lazy load pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PatientsPage = lazy(() => import('./pages/PatientsPage'));
const AgendaPage = lazy(() => import('./pages/AgendaPage'));
const ConsultationsList = lazy(() => import('./pages/ConsultationsList'));
const PatientDetails = lazy(() => import('./pages/PatientDetails'));
const ConsultationPage = lazy(() => import('./pages/ConsultationPage'));
const Settings = lazy(() => import('./pages/Settings'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const TeamManagement = lazy(() => import('./pages/TeamManagement'));
const BillingPage = lazy(() => import('./pages/BillingPage'));
const ReceiptsPage = lazy(() => import('./pages/ReceiptsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentReturn = lazy(() => import('./pages/PaymentReturn'));

const SidebarItem = ({ to, icon: Icon, label, active, subItems, onClick }: { to?: string, icon: any, label: string, active: boolean, subItems?: { label: string, to: string, icon: any, active: boolean }[], onClick?: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(active || subItems?.some(s => s.active));

  const content = (
    <div className="flex flex-col">
      {to ? (
        <Link to={to} onClick={onClick}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              active && !subItems?.some(s => s.active)
                ? 'bg-apple-blue text-white shadow-lg' 
                : 'text-apple-gray-dark hover:bg-black/5 hover:text-[#1C1C1E]'
            }`}
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
            {active && !subItems?.some(s => s.active) && <motion.div layoutId="active-indicator" className="ml-auto"><ChevronRight size={16} /></motion.div>}
          </motion.div>
        </Link>
      ) : (
        <div onClick={() => setIsExpanded(!isExpanded)}>
          <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active || subItems?.some(s => s.active)
                  ? 'bg-slate-100 text-slate-900 shadow-sm font-semibold'
                  : 'text-apple-gray-dark hover:bg-black/5 hover:text-[#1C1C1E] font-medium'
              } cursor-pointer select-none`}
            >
              <Icon size={20} />
              <span className="font-medium flex-1">{label}</span>
              <div className="ml-auto opacity-70">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            </motion.div>
        </div>
      )}
      
      <AnimatePresence>
        {subItems && isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="ml-6 pl-4 border-l-2 border-black/5 flex flex-col gap-1 mt-1 mb-2 py-1">
              {subItems.map((item, idx) => (
                <Link key={idx} to={item.to} onClick={onClick}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      item.active 
                        ? 'bg-apple-blue/10 text-apple-blue font-bold shadow-sm' 
                        : 'text-apple-gray-dark hover:bg-black/5 hover:text-[#1C1C1E]'
                    }`}
                  >
                    <item.icon size={16} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  return content;
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (userProfile && !userProfile.onboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const sidebarContent = (
    <>
      <div className="flex flex-col mb-10 px-2 mt-4 ml-2">
        <div className="flex items-center gap-3">
          {userProfile?.logoUrl ? (
            <img src={userProfile.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
          ) : (
            <div className="w-10 h-10 bg-apple-blue rounded-xl flex items-center justify-center text-white shadow-blue-500/30 shadow-lg">
              <ClipboardList size={24} />
            </div>
          )}
          <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-tight">
            {userProfile?.clinicName || 'MedSystem'}
          </h1>
        </div>
        {!userProfile?.clinicName && (
          <p className="text-[10px] uppercase tracking-widest text-apple-gray-dark font-bold mt-1 ml-13">Plataforma em Nuvem</p>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        <SidebarItem 
          to="/dashboard" 
          icon={LayoutDashboard} 
          label="Dashboard" 
          active={location.pathname === '/dashboard'}
          onClick={() => setMobileMenuOpen(false)}
        />
        <SidebarItem
          to="/agenda"
          icon={CalendarDays}
          label="Agenda"
          active={location.pathname === '/agenda'}
          onClick={() => setMobileMenuOpen(false)}
        />
        <SidebarItem
          to="/patients"
          icon={Users}
          label="Pacientes"
          active={location.pathname === '/patients' || location.pathname.startsWith('/patients/')}
          onClick={() => setMobileMenuOpen(false)}
        />
        <SidebarItem
          to="/consultations"
          icon={ClipboardList}
          label="Consultas"
          active={location.pathname === '/consultations'}
          onClick={() => setMobileMenuOpen(false)}
        />
        <SidebarItem
          to="/reports"
          icon={BarChart}
          label="Relatórios"
          active={location.pathname === '/reports'}
          onClick={() => setMobileMenuOpen(false)}
        />
        <SidebarItem
          to="/team" 
          icon={UsersRound} 
          label="Gestão de Equipe" 
          active={location.pathname === '/team'}
          onClick={() => setMobileMenuOpen(false)}
        />
        <SidebarItem
          to="/receipts"
          icon={Receipt}
          label="Recibos"
          active={location.pathname === '/receipts'}
          onClick={() => setMobileMenuOpen(false)}
        />
        <SidebarItem
          to="/billing"
          icon={CreditCard}
          label="Faturamento"
          active={location.pathname === '/billing'}
          onClick={() => setMobileMenuOpen(false)}
        />
        <SidebarItem 
          to="/settings" 
          icon={SettingsIcon} 
          label="Configurações" 
          active={location.pathname === '/settings'}
          onClick={() => setMobileMenuOpen(false)}
        />
      </nav>

      <div className="mt-auto pt-6 border-t border-black/5">
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-black/5 flex items-center gap-3 mb-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-apple-blue to-[#5856D6] flex items-center justify-center text-white font-bold shadow-sm shrink-0">
            {userProfile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'V'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate">{userProfile?.name || user.email}</p>
            <p className="text-[10px] text-apple-gray-dark font-semibold truncate">
              {userProfile?.clinicName || 'CRM Não Informado'}
            </p>
          </div>
        </div>
        <PWAInstallButton
          variant="outline"
          className="w-full justify-start gap-3 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 mb-2 font-bold"
        />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
          onClick={() => signOut(auth)}
        >
          <LogOut size={20} />
          <span>Sair</span>
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8F9FA]">
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-black/5 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 min-w-0">
          {userProfile?.logoUrl ? (
            <img src={userProfile.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 bg-apple-blue rounded-lg flex items-center justify-center text-white shrink-0">
              <ClipboardList size={18} />
            </div>
          )}
          <span className="font-bold truncate">{userProfile?.clinicName || 'MedSystem'}</span>
        </div>
        <button onClick={toggleMenu} className="p-2 rounded-full hover:bg-black/5">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex ipad-sidebar flex-col p-6 z-10 bg-white border-r border-black/5">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
              onClick={toggleMenu}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white flex flex-col p-6 z-50 lg:hidden shadow-2xl overflow-y-auto"
            >
              <button 
                onClick={toggleMenu}
                className="absolute top-6 right-4 p-2 text-gray-500 hover:bg-gray-100 animate-in fade-in zoom-in duration-300 rounded-full z-10"
              >
                <X size={20} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col z-0 relative pt-16 lg:pt-0 min-w-0 w-full overflow-x-hidden">
        <ScrollArea className="flex-1 p-4 lg:p-8 w-full">
          <div className="max-w-6xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <HelmetProvider>
    <FirebaseProvider>
      <Router>
        <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#F8F9FA] text-apple-blue font-bold">Carregando MedSystem...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/patients" element={<MainLayout><PatientsPage /></MainLayout>} />
            <Route path="/agenda" element={<MainLayout><AgendaPage /></MainLayout>} />
            <Route path="/patients/:id" element={<MainLayout><PatientDetails /></MainLayout>} />
            <Route path="/consultations" element={<MainLayout><ConsultationsList /></MainLayout>} />
            <Route path="/consultation/:patientId" element={<MainLayout><ConsultationPage /></MainLayout>} />
            <Route path="/consultation/:patientId/:consultaId" element={<MainLayout><ConsultationPage /></MainLayout>} />
            <Route path="/reports" element={<MainLayout><ReportsPage /></MainLayout>} />
            <Route path="/team" element={<MainLayout><TeamManagement /></MainLayout>} />
            <Route path="/billing" element={<MainLayout><BillingPage /></MainLayout>} />
            <Route path="/receipts" element={<MainLayout><ReceiptsPage /></MainLayout>} />
            <Route path="/billing/plans" element={<MainLayout><BillingPage /></MainLayout>} />
            <Route path="/billing/checkout" element={<CheckoutPage />} />
            <Route path="/billing/success" element={<PaymentReturn variant="success" />} />
            <Route path="/billing/failure" element={<PaymentReturn variant="failure" />} />
            <Route path="/billing/pending" element={<PaymentReturn variant="pending" />} />
            <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
        <Toaster position="top-right" />
        <PWAInstallPrompt />
      </Router>
    </FirebaseProvider>
    </HelmetProvider>
  );
}

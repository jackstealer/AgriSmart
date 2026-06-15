import { useState, lazy, Suspense } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Leaf, ShoppingCart, Package, Cloud, TrendingUp,
  AlertCircle, MessageSquare, User, Menu, X, LogOut,
  Sun, Moon, Sparkles, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

// Lazy load CropOrb — it's only in the sidebar logo area
const CropOrb = lazy(() => import('../components/three/CropOrb'));

// Animated nav item
function NavItem({ item, isActive, onClick }) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden
        ${isActive
          ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-900/40'
          : 'text-white/60 hover:text-white hover:bg-white/6'
        }
      `}
    >
      {/* Active glow background */}
      {isActive && (
        <motion.div
          layoutId="nav-active-glow"
          className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-green-500/80 rounded-xl"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      {/* Left accent line when active */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full" />
      )}

      <item.icon className={`relative w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'text-white' : 'text-white/50 group-hover:text-green-400 group-hover:scale-110'}`} />
      <span className={`relative font-medium text-sm ${isActive ? 'text-white' : ''}`}>
        {item.label}
      </span>

      {isActive && (
        <ChevronRight className="relative w-4 h-4 text-white/70 ml-auto" />
      )}
    </Link>
  );
}

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: Home,         label: t('nav.dashboard'), path: '/dashboard'  },
    { icon: Leaf,         label: t('nav.crops'),     path: '/crops'      },
    { icon: ShoppingCart, label: t('nav.orders'),    path: '/orders'     },
    { icon: Package,      label: t('nav.shipments'), path: '/shipments'  },
    { icon: Cloud,        label: t('nav.weather'),   path: '/weather'    },
    { icon: TrendingUp,   label: t('nav.prices'),    path: '/prices'     },
    { icon: AlertCircle,  label: t('nav.disease'),   path: '/disease'    },
    { icon: MessageSquare,label: t('nav.chatbot'),   path: '/chatbot'    },
    { icon: User,         label: t('nav.profile'),   path: '/profile'    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ── Mobile Header ──────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-dark border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-shimmer">AgriSmart</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <AnimatePresence mode="wait">
              {sidebarOpen
                ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X /></motion.div>
                : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Menu /></motion.div>
              }
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <AnimatePresence>
        {(sidebarOpen || true) && (
          <aside className={`
            fixed top-0 left-0 z-50 h-full w-64 bg-gray-900/95 border-r border-white/8
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
          `}
          style={{ backdropFilter: 'blur(20px)' }}
          >
            <div className="flex flex-col h-full">

              {/* Logo + Mini CropOrb */}
              <div className="p-5 border-b border-white/8">
                <div className="flex items-center gap-3">
                  {/* Mini 3D orb */}
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden">
                    <Suspense fallback={
                      <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                      </div>
                    }>
                      <CropOrb style={{ width: '100%', height: '100%' }} />
                    </Suspense>
                  </div>

                  <div>
                    <h1 className="text-lg font-black text-shimmer">AgriSmart</h1>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <p className="text-xs text-white/40 capitalize">{user?.role}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {menuItems.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    isActive={location.pathname === item.path}
                    onClick={() => setSidebarOpen(false)}
                  />
                ))}
              </nav>

              {/* Divider with glow */}
              <div className="mx-4 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

              {/* User Profile Area */}
              <div className="p-4 pt-3">
                <div className="glass-green rounded-xl p-3 border border-green-500/20 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="border-2 border-green-500/50">
                      <AvatarImage src={user?.profileImage} />
                      <AvatarFallback className="bg-green-700 text-white font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate">{user?.name}</p>
                      <p className="text-xs text-white/40 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout')}
                </Button>
              </div>
            </div>
          </aside>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">

        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-6 py-4 glass-dark border-b border-white/8 sticky top-0 z-30">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400 font-semibold uppercase tracking-widest">
                {menuItems.find(m => m.path === location.pathname)?.label || 'Dashboard'}
              </span>
            </div>
            <p className="text-sm text-white/40 mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
            >
              {theme === 'dark'
                ? <Sun className="w-5 h-5 text-yellow-400" />
                : <Moon className="w-5 h-5 text-blue-400" />
              }
            </Button>

            {/* AI status badge */}
            <div className="flex items-center gap-2 glass-green rounded-xl px-3 py-2 border border-green-500/25">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-300 font-medium hidden xl:block">AI Active</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

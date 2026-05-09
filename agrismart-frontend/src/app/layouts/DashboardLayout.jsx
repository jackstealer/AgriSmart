import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Leaf, ShoppingCart, Package, Cloud, TrendingUp, AlertCircle, MessageSquare, User, Menu, X, LogOut, Sun, Moon, } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
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
        { icon: Home, label: t('nav.dashboard'), path: '/dashboard' },
        { icon: Leaf, label: t('nav.crops'), path: '/crops' },
        { icon: ShoppingCart, label: t('nav.orders'), path: '/orders' },
        { icon: Package, label: t('nav.shipments'), path: '/shipments' },
        { icon: Cloud, label: t('nav.weather'), path: '/weather' },
        { icon: TrendingUp, label: t('nav.prices'), path: '/prices' },
        { icon: AlertCircle, label: t('nav.disease'), path: '/disease' },
        { icon: MessageSquare, label: t('nav.chatbot'), path: '/chatbot' },
        { icon: User, label: t('nav.profile'), path: '/profile' },
    ];
    return (<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary"/>
            <span className="text-xl font-bold text-primary">AgriSmart</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white"/>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AgriSmart</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (<Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                  `}>
                  <item.icon className="w-5 h-5"/>
                  <span className="font-medium">{item.label}</span>
                </Link>);
        })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarImage src={user?.profileImage}/>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4"/>
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (<div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}/>)}

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <header className="hidden lg:flex items-center justify-between p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.welcomeBack')}, {user?.name}! 👋
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('dashboard.manageOps')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
            </Button>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>);
};

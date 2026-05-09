import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { CropsPage } from './pages/CropsPage';
import { OrdersPage } from './pages/OrdersPage';
import { ShipmentsPage } from './pages/ShipmentsPage';
import { WeatherPage } from './pages/WeatherPage';
import { PricesPage } from './pages/PricesPage';
import { DiseasePage } from './pages/DiseasePage';
import { ChatbotPage } from './pages/ChatbotPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
export const router = createBrowserRouter([
    {
        path: '/',
        Component: LandingPage,
    },
    {
        path: '/login',
        Component: LoginPage,
    },
    {
        path: '/signup',
        Component: SignupPage,
    },
    {
        path: '/',
        Component: () => (<ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>),
        children: [
            {
                path: 'dashboard',
                Component: DashboardPage,
            },
            {
                path: 'crops',
                Component: CropsPage,
            },
            {
                path: 'orders',
                Component: OrdersPage,
            },
            {
                path: 'shipments',
                Component: ShipmentsPage,
            },
            {
                path: 'weather',
                Component: WeatherPage,
            },
            {
                path: 'prices',
                Component: PricesPage,
            },
            {
                path: 'disease',
                Component: DiseasePage,
            },
            {
                path: 'chatbot',
                Component: ChatbotPage,
            },
            {
                path: 'profile',
                Component: ProfilePage,
            },
        ],
    },
    {
        path: '*',
        Component: NotFoundPage,
    },
]);

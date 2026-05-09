# 🚀 AgriSmart - Complete Project Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Folder Structure](#folder-structure)
4. [Features Breakdown](#features-breakdown)
5. [API Integration Guide](#api-integration-guide)
6. [State Management](#state-management)
7. [Styling Guide](#styling-guide)
8. [Development Workflow](#development-workflow)
9. [Testing](#testing)
10. [Deployment](#deployment)

## 🎯 Project Overview

AgriSmart is a comprehensive agriculture management platform that bridges the gap between farmers and buyers. The platform provides:

- **For Farmers**: Crop management, market insights, weather forecasts, disease detection
- **For Buyers**: Browse crops, place orders, track shipments, view market prices
- **For Both**: AI chatbot assistance, real-time updates, secure transactions

### Technology Stack
```
Frontend:
├── React 18.3 (UI Library)
├── TypeScript (Type Safety)
├── Vite 6.3 (Build Tool)
├── Tailwind CSS 4.1 (Styling)
├── React Router 7.13 (Routing)
├── Context API (State Management)
├── Axios (API Client)
├── Motion (Animations)
├── Recharts (Data Visualization)
└── Radix UI (Component Library)
```

## 🏗️ Architecture

### Component Architecture
```
┌─────────────────────────────────────┐
│           App.tsx (Root)            │
│  ┌──────────────────────────────┐   │
│  │   ThemeProvider              │   │
│  │  ┌───────────────────────┐   │   │
│  │  │   AuthProvider        │   │   │
│  │  │  ┌────────────────┐   │   │   │
│  │  │  │ RouterProvider │   │   │   │
│  │  │  └────────────────┘   │   │   │
│  │  └───────────────────────┘   │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Data Flow
```
User Action → Component → API Service → Backend
                ↓                          ↓
         Update State ← Process Response ←┘
                ↓
           Re-render UI
```

## 📁 Folder Structure

```
agrismart/
├── src/
│   ├── app/
│   │   ├── components/         # Reusable components
│   │   │   ├── ui/            # UI component library (Radix)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── ... (40+ components)
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── context/           # Context providers
│   │   │   └── AuthContext.tsx    # Authentication state
│   │   │
│   │   ├── layouts/           # Layout components
│   │   │   └── DashboardLayout.tsx
│   │   │
│   │   ├── pages/             # Page components
│   │   │   ├── LandingPage.tsx       # Marketing page
│   │   │   ├── LoginPage.tsx         # Authentication
│   │   │   ├── SignupPage.tsx        # Registration
│   │   │   ├── DashboardPage.tsx     # Main dashboard
│   │   │   ├── CropsPage.tsx         # Crop CRUD
│   │   │   ├── OrdersPage.tsx        # Order management
│   │   │   ├── ShipmentsPage.tsx     # Tracking
│   │   │   ├── WeatherPage.tsx       # Weather info
│   │   │   ├── PricesPage.tsx        # Market prices
│   │   │   ├── DiseasePage.tsx       # AI detection
│   │   │   ├── ChatbotPage.tsx       # AI assistant
│   │   │   ├── ProfilePage.tsx       # User settings
│   │   │   └── NotFoundPage.tsx      # 404
│   │   │
│   │   ├── services/          # API & business logic
│   │   │   ├── api.ts                # API client
│   │   │   └── mockData.ts           # Fallback data
│   │   │
│   │   ├── utils/             # Utility functions
│   │   │   ├── helpers.ts            # Helper functions
│   │   │   └── constants.ts          # App constants
│   │   │
│   │   ├── App.tsx            # Root component
│   │   └── routes.tsx         # Route configuration
│   │
│   └── styles/                # Global styles
│       ├── index.css          # Entry point
│       ├── tailwind.css       # Tailwind imports
│       ├── theme.css          # Custom theme
│       └── fonts.css          # Font imports
│
├── public/                    # Static assets
├── README.md                  # Main documentation
├── PROJECT_GUIDE.md          # This file
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite configuration
└── tailwind.config.js        # Tailwind config
```

## 🎨 Features Breakdown

### 1. Authentication System
**Files**: `LoginPage.tsx`, `SignupPage.tsx`, `AuthContext.tsx`, `ProtectedRoute.tsx`

**Features**:
- JWT token-based authentication
- Role-based access control (Farmer/Buyer)
- Protected routes
- Persistent sessions
- Auto-redirect on authentication

**Mock Login**:
```typescript
Farmer: farmer@agrismart.com / password123
Buyer: buyer@agrismart.com / password123
```

### 2. Dashboard
**File**: `DashboardPage.tsx`

**Features**:
- Role-specific statistics
- Revenue charts (Recharts)
- Recent activity
- Quick actions
- Market price overview

**Farmer View**:
- Total crops, Active crops
- Order count, Revenue trends
- Crop growth status

**Buyer View**:
- Total orders, Active orders
- Spending analytics
- Savings tracker

### 3. Crop Management
**File**: `CropsPage.tsx`

**Features**:
- CRUD operations (Create, Read, Update, Delete)
- Search and filter
- Image upload support
- Status tracking
- Inventory management

**Data Model**:
```typescript
{
  id: string;
  name: string;
  variety: string;
  quantity: number;
  unit: string;
  location: string;
  plantingDate: string;
  expectedHarvest: string;
  status: 'growing' | 'harvested' | 'sold';
  price: number;
  image: string;
}
```

### 4. Order Management
**File**: `OrdersPage.tsx`

**Features**:
- View all orders
- Filter by status (Pending, Confirmed, Shipped)
- Order details
- Status tracking
- Buyer-Seller information

### 5. Shipment Tracking
**File**: `ShipmentsPage.tsx`

**Features**:
- Real-time tracking
- Timeline view
- Location updates
- Estimated delivery
- Tracking ID search

### 6. Weather Forecasts
**File**: `WeatherPage.tsx`

**Features**:
- Current conditions
- 5-day forecast
- Weather alerts
- Farming recommendations
- Location-based data

### 7. Market Prices
**File**: `PricesPage.tsx`

**Features**:
- Real-time prices
- Price trends (Charts)
- Historical data
- Market insights
- Percentage changes

### 8. Disease Detection
**File**: `DiseasePage.tsx`

**Features**:
- Image upload
- AI-powered analysis
- Disease identification
- Treatment recommendations
- Prevention tips
- Confidence score

### 9. AI Chatbot
**File**: `ChatbotPage.tsx`

**Features**:
- Natural language processing
- Context-aware responses
- Quick questions
- Chat history
- Real-time messaging

### 10. User Profile
**File**: `ProfilePage.tsx`

**Features**:
- Profile editing
- Avatar management
- Account statistics
- Security settings
- Personal information

## 🔌 API Integration Guide

### Setting Up Backend Connection

1. **Configure API URL**
```typescript
// src/app/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

2. **Environment Variable**
```bash
# .env
VITE_API_URL=https://your-backend-api.com
```

3. **API Service Structure**
```typescript
// Example service
export const cropService = {
  getAllCrops: () => apiClient.get('/api/crops'),
  getCropById: (id: string) => apiClient.get(`/api/crops/${id}`),
  createCrop: (data: any) => apiClient.post('/api/crops', data),
  updateCrop: (id: string, data: any) => apiClient.put(`/api/crops/${id}`, data),
  deleteCrop: (id: string) => apiClient.delete(`/api/crops/${id}`),
};
```

### Using API Services in Components

```typescript
import { cropService } from '../services/api';
import { mockCrops } from '../services/mockData';

const CropsPage = () => {
  const [crops, setCrops] = useState([]);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await cropService.getAllCrops();
        setCrops(response.data);
      } catch (error) {
        // Fallback to mock data
        console.error('API Error:', error);
        setCrops(mockCrops);
      }
    };
    fetchCrops();
  }, []);
};
```

### Error Handling

The API client includes automatic error handling:
- 401 Unauthorized → Redirect to login
- Network errors → Use mock data
- Toast notifications for user feedback

## 🎯 State Management

### Authentication State (Context API)

```typescript
// AuthContext provides:
{
  user: User | null;              // Current user
  token: string | null;           // JWT token
  isAuthenticated: boolean;       // Auth status
  login: (email, password) => Promise<void>;
  register: (data) => Promise<void>;
  logout: () => void;
  isLoading: boolean;            // Loading state
}
```

### Usage in Components
```typescript
import { useAuth } from '../context/AuthContext';

const Component = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <div>Welcome, {user?.name}</div>;
};
```

## 🎨 Styling Guide

### Tailwind CSS Custom Theme

```css
/* src/styles/theme.css */
:root {
  --primary: #16a34a;           /* Green */
  --secondary: #f0fdf4;         /* Light Green */
  --accent: #dcfce7;            /* Lighter Green */
  --agri-green: #16a34a;
  --agri-lime: #84cc16;
  --agri-earth: #92400e;
}
```

### Component Styling Patterns

```tsx
// Card with gradient
<Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
  {/* Content */}
</Card>

// Glassmorphism effect
<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
  {/* Content */}
</div>

// Hover effects
<Card className="hover:shadow-lg transition-all duration-300">
  {/* Content */}
</Card>
```

### Dark Mode Support

```typescript
import { useTheme } from 'next-themes';

const Component = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
};
```

## 🔄 Development Workflow

### Adding a New Feature

1. **Create Service Method**
```typescript
// src/app/services/api.ts
export const newFeatureService = {
  getData: () => apiClient.get('/api/new-feature'),
};
```

2. **Add Mock Data**
```typescript
// src/app/services/mockData.ts
export const mockNewFeature = [
  { id: '1', name: 'Test Data' }
];
```

3. **Create Page Component**
```typescript
// src/app/pages/NewFeaturePage.tsx
export const NewFeaturePage = () => {
  // Component logic
};
```

4. **Add Route**
```typescript
// src/app/routes.tsx
{
  path: 'new-feature',
  Component: NewFeaturePage,
}
```

5. **Add Navigation**
```typescript
// src/app/layouts/DashboardLayout.tsx
{ icon: Icon, label: 'New Feature', path: '/new-feature' }
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login with farmer account
- [ ] Login with buyer account
- [ ] Add new crop
- [ ] Edit existing crop
- [ ] Delete crop
- [ ] Create order
- [ ] Track shipment
- [ ] Check weather forecast
- [ ] View market prices
- [ ] Upload disease image
- [ ] Chat with AI assistant
- [ ] Update profile
- [ ] Toggle dark mode
- [ ] Test responsive design
- [ ] Test without backend (mock data)

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Environment Variables Setup

```bash
# Production
VITE_API_URL=https://api.agrismart.com

# Staging
VITE_API_URL=https://staging-api.agrismart.com

# Development
VITE_API_URL=http://localhost:5000
```

## 📱 Mobile Responsiveness

### Breakpoints Used
```typescript
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
```

### Mobile Menu
- Hamburger menu on mobile
- Slide-in sidebar
- Touch-friendly buttons
- Optimized images

## 🔐 Security Best Practices

1. **JWT Token Storage**: localStorage with auto-refresh
2. **Protected Routes**: Authentication required
3. **Input Validation**: Client-side validation
4. **XSS Protection**: React's built-in escaping
5. **HTTPS Only**: Production deployment

## 📊 Performance Optimization

1. **Code Splitting**: Route-based
2. **Lazy Loading**: Images and components
3. **Memoization**: React.memo, useMemo
4. **Debouncing**: Search inputs
5. **Image Optimization**: Responsive images

## 🎯 Next Steps

1. **Connect to Real Backend**
   - Update API_BASE_URL
   - Test all endpoints
   - Handle real authentication

2. **Add Features**
   - Payment gateway integration
   - Real-time notifications
   - Advanced analytics
   - Multi-language support

3. **Optimize**
   - Performance monitoring
   - Error tracking (Sentry)
   - Analytics (Google Analytics)
   - SEO optimization

4. **Testing**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Playwright)

## 📞 Support

For questions or issues:
- GitHub Issues: [Create Issue]
- Email: support@agrismart.com
- Documentation: This file

---

**Last Updated**: March 19, 2025
**Version**: 1.0.0
**Maintainer**: AgriSmart Team

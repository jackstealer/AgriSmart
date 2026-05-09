# 🌱 AgriSmart - Smart Agriculture Platform

A modern, full-featured agriculture management platform built with React, TypeScript, and Tailwind CSS. AgriSmart connects farmers and buyers with powerful tools for crop management, market insights, weather forecasts, disease detection, and AI assistance.

![AgriSmart](https://images.unsplash.com/photo-1614533811170-b8bb30e39f7d?w=1200)

## ✨ Features

### 🔐 Authentication
- JWT-based authentication
- Role-based access (Farmer/Buyer)
- Secure login and registration
- Protected routes

### 🌾 Crop Management
- CRUD operations for crops
- Real-time inventory tracking
- Search and filter capabilities
- Image upload support
- Status tracking (Growing, Harvested, Sold)

### 📦 Order Management
- Place and track orders
- Order status updates
- Buyer-Seller connection
- Order history

### 🚚 Shipment Tracking
- Real-time shipment tracking
- Timeline view of delivery status
- Estimated delivery dates
- Location tracking

### ☁️ Weather Forecasts
- Current weather conditions
- 5-day forecast
- Weather alerts and recommendations
- Location-based forecasts

### 📈 Market Prices
- Real-time market prices
- Price trends and analytics
- Historical price data
- Market insights and alerts

### 🔬 Disease Detection
- AI-powered disease detection
- Image upload and analysis
- Treatment recommendations
- Prevention tips
- Detailed disease information

### 🤖 AI Chatbot
- Intelligent farming assistant
- Instant answers to queries
- Context-aware responses
- Quick question suggestions

### 👤 User Profile
- Profile management
- Account statistics
- Security settings
- Avatar customization

## 🚀 Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite 6.3** - Build tool
- **Tailwind CSS 4.1** - Styling

### Routing & State
- **React Router 7.13** - Navigation
- **Context API** - State management

### UI Components
- **Radix UI** - Accessible components
- **Lucide React** - Icons
- **Recharts** - Charts and graphs
- **Motion (Framer Motion)** - Animations
- **Sonner** - Toast notifications

### API Integration
- **Axios 1.13** - HTTP client
- Mock data fallback system

## 📂 Project Structure

```
src/
├── app/
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI component library
│   │   ├── LoadingSpinner.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx
│   ├── layouts/            # Layout components
│   │   └── DashboardLayout.tsx
│   ├── pages/              # Page components
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CropsPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── ShipmentsPage.tsx
│   │   ├── WeatherPage.tsx
│   │   ├── PricesPage.tsx
│   │   ├── DiseasePage.tsx
│   │   ├── ChatbotPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/           # API services
│   │   ├── api.ts         # API client & services
│   │   └── mockData.ts    # Mock data for demo
│   ├── App.tsx            # Root component
│   └── routes.tsx         # Route configuration
├── styles/                 # Global styles
│   ├── index.css
│   ├── tailwind.css
│   ├── theme.css          # Custom theme
│   └── fonts.css
└── ...
```

## 🎨 Design System

### Color Palette
- **Primary**: Green (#16a34a) - Agriculture theme
- **Secondary**: Lime (#84cc16) - Fresh, natural
- **Accent**: Light Green (#dcfce7)
- **Earth Tones**: Brown, Amber for warmth

### Components
- Glassmorphism effects
- Smooth animations
- Card-based layouts
- Responsive design
- Dark mode support

## 🔌 API Integration

### Backend Endpoints

The platform integrates with the following REST APIs:

```typescript
// Auth
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout

// Users
GET /api/users/profile
PUT /api/users/profile
GET /api/users

// Crops
GET /api/crops
GET /api/crops/:id
POST /api/crops
PUT /api/crops/:id
DELETE /api/crops/:id

// Orders
GET /api/orders
GET /api/orders/:id
POST /api/orders
PUT /api/orders/:id/status
DELETE /api/orders/:id

// Shipments
GET /api/shipments
GET /api/shipments/:id
GET /api/shipments/track/:trackingId
PUT /api/shipments/:id

// Weather
GET /api/weather/current
GET /api/weather/forecast

// Prices
GET /api/prices
GET /api/prices/:product
GET /api/prices/:product/trends

// Disease Detection
POST /api/disease/detect
GET /api/disease/history

// Chatbot
POST /api/chatbot/message
GET /api/chatbot/conversation/:id
GET /api/chatbot/conversations
```

### API Service Configuration

Update the API base URL in `/src/app/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

Or set the environment variable:

```bash
VITE_API_URL=https://your-backend-url.com
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd agrismart
```

2. Install dependencies
```bash
npm install
# or
pnpm install
```

3. Set up environment variables
```bash
# Create .env file
VITE_API_URL=http://localhost:5000
```

4. Start development server
```bash
npm run dev
# or
pnpm dev
```

5. Build for production
```bash
npm run build
# or
pnpm build
```

## 🔑 Demo Credentials

### Farmer Account
- **Email**: farmer@agrismart.com
- **Password**: password123

### Buyer Account
- **Email**: buyer@agrismart.com
- **Password**: password123

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

## 🌓 Dark Mode

Built-in dark mode support using `next-themes`:
- Automatic system detection
- Manual toggle
- Persisted preference
- Smooth transitions

## 🎯 Key Features Implementation

### Role-Based Access Control
```typescript
// Farmer-specific features
- Add/Edit/Delete crops
- View buyer orders
- Manage listings

// Buyer-specific features
- Browse crops
- Place orders
- Track shipments
```

### Mock Data Fallback
The app includes comprehensive mock data in `/src/app/services/mockData.ts` that activates when the backend API is unavailable, ensuring the UI remains functional for demo purposes.

### Animations
Smooth page transitions and micro-interactions using Motion:
- Page entrance animations
- Card hover effects
- Loading states
- Smooth transitions

### Error Handling
- API error catching
- Toast notifications
- Graceful fallbacks
- Loading states

## 🔧 Customization

### Theme Colors
Edit `/src/styles/theme.css` to customize:
- Primary colors
- Secondary colors
- Component styles
- Dark mode colors

### Adding New Pages
1. Create page component in `/src/app/pages/`
2. Add route in `/src/app/routes.tsx`
3. Add navigation link in `/src/app/layouts/DashboardLayout.tsx`

### Adding New API Services
1. Add service methods in `/src/app/services/api.ts`
2. Add corresponding mock data in `/src/app/services/mockData.ts`
3. Implement in page components

## 🚀 Deployment

### Build
```bash
npm run build
```

### Deploy to Vercel/Netlify
The app is ready for deployment to static hosting platforms:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Environment Variables
Set these in your deployment platform:
```
VITE_API_URL=https://your-backend-api.com
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Images from [Unsplash](https://unsplash.com/)
- UI Components from [Radix UI](https://www.radix-ui.com/)
- Charts by [Recharts](https://recharts.org/)

## 📧 Support

For support, email support@agrismart.com or open an issue on GitHub.

---

Built with ❤️ for farmers worldwide 🌾

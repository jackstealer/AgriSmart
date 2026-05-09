# ⚡ AgriSmart - Quick Start Guide

Get up and running with AgriSmart in 5 minutes!

## 🚀 Instant Setup

### 1. Environment (Already Done! ✅)
The project is already set up with all dependencies installed and configured.

### 2. Demo the App

**Option A: Use Mock Data (Recommended for Demo)**
The app works perfectly without a backend using built-in mock data.

Just login with demo credentials:

**Farmer Account:**
```
Email: farmer@agrismart.com
Password: password123
```

**Buyer Account:**
```
Email: buyer@agrismart.com  
Password: password123
```

**Option B: Connect Your Backend**

Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

Replace with your actual backend URL.

## 📱 What to Explore

### 🌱 Landing Page (`/`)
- Beautiful hero section
- Feature showcase
- Call-to-action buttons
- Responsive design

### 🔐 Authentication
1. Click "Get Started" or "Login"
2. Use demo credentials above
3. Experience role-based dashboards

### 👨‍🌾 Farmer Dashboard Features
After logging in as a farmer:

1. **Dashboard** - View statistics, revenue charts
2. **Crops** - Add, edit, delete crops
3. **Orders** - Track incoming orders
4. **Weather** - 5-day forecast
5. **Prices** - Market trends
6. **Disease Detection** - Upload crop images
7. **AI Chatbot** - Ask farming questions

### 🛒 Buyer Dashboard Features
After logging in as a buyer:

1. **Dashboard** - Order statistics, savings
2. **Crops** - Browse available crops
3. **Orders** - Place and track orders
4. **Shipments** - Real-time tracking
5. **Prices** - Market analysis
6. **AI Chatbot** - Get assistance

## 🎨 UI Features to Try

### Dark Mode
- Click the sun/moon icon in the top navigation
- Smooth theme transition
- All pages support dark mode

### Responsive Design
- Resize your browser window
- Works on mobile, tablet, and desktop
- Hamburger menu on mobile

### Animations
- Page transitions using Motion
- Card hover effects
- Loading states
- Smooth scrolling

## 🎯 Key Components to Test

### 1. Crop Management
```
1. Login as farmer
2. Go to Crops page
3. Click "Add Crop"
4. Fill in details
5. Submit
6. Edit or delete crops
```

### 2. Disease Detection
```
1. Go to Disease Detection
2. Upload an image (any crop image)
3. Click "Analyze"
4. View AI results with treatment
```

### 3. AI Chatbot
```
1. Go to AI Assistant
2. Type: "What is the current weather?"
3. Try: "Show me market prices"
4. Use quick question buttons
```

### 4. Market Prices
```
1. View real-time price cards
2. Check price trends chart
3. Read market insights
```

## 🔧 Customization Quick Tips

### Change Primary Color
```css
/* src/styles/theme.css */
:root {
  --primary: #16a34a; /* Change this */
}
```

### Add a New Page
```typescript
// 1. Create page: src/app/pages/NewPage.tsx
export const NewPage = () => <div>New Page</div>;

// 2. Add route: src/app/routes.tsx
{ path: 'new-page', Component: NewPage }

// 3. Add navigation: src/app/layouts/DashboardLayout.tsx
{ icon: Icon, label: 'New Page', path: '/new-page' }
```

### Connect to Your API
```typescript
// src/app/services/api.ts
const API_BASE_URL = 'https://your-api.com';
```

## 📊 Mock Data Overview

All mock data is in: `src/app/services/mockData.ts`

Available datasets:
- `mockUser` - User profile
- `mockCrops` - Sample crops (Wheat, Rice, Tomatoes)
- `mockOrders` - Order history
- `mockShipments` - Tracking info
- `mockWeather` - Weather data
- `mockPrices` - Market prices
- `mockDiseaseResult` - AI detection results
- `mockChatHistory` - Chatbot messages

## 🎬 Demo Flow Suggestions

### For Investors/Stakeholders (5 min)
```
1. Landing Page → Show features
2. Login as Farmer → Dashboard overview
3. Crops → Add new crop
4. Disease Detection → AI demo
5. Chatbot → Interactive Q&A
6. Dark mode toggle
```

### For Developers (10 min)
```
1. Show folder structure
2. Explain routing system
3. Demo API integration
4. Show state management
5. Customize theme
6. Add new feature
```

### For Users (15 min)
```
1. Registration flow
2. Dashboard walkthrough
3. Add crops
4. Check weather
5. View prices
6. Disease detection
7. Chat with AI
8. Profile management
```

## ⚠️ Common Issues & Solutions

### Issue: Blank page after login
**Solution**: Check browser console. Clear localStorage and try again.
```javascript
localStorage.clear()
```

### Issue: API errors
**Solution**: App automatically falls back to mock data. Check network tab.

### Issue: Dark mode not working
**Solution**: The theme is controlled by next-themes. Check localStorage for theme preference.

## 📱 Mobile Testing

### Test on Mobile Device
```
1. Open browser DevTools (F12)
2. Click device toolbar icon
3. Select iPhone/Android
4. Test navigation and forms
```

### Mobile-specific Features
- Hamburger menu
- Touch-friendly buttons
- Swipe gestures
- Optimized images

## 🎨 Design Tokens

Quick reference for consistent design:

**Colors:**
- Primary Green: `#16a34a`
- Light Green: `#22c55e`
- Lime: `#84cc16`
- Earth: `#92400e`

**Spacing:**
- sm: `0.5rem` (8px)
- md: `1rem` (16px)
- lg: `1.5rem` (24px)
- xl: `2rem` (32px)

**Border Radius:**
- sm: `0.375rem`
- md: `0.5rem`
- lg: `0.625rem`
- xl: `0.75rem`

## 🚀 Production Deployment

### Quick Deploy to Vercel
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Run deploy
vercel

# 3. Follow prompts
# 4. Done! ✨
```

### Environment Variables for Production
```
VITE_API_URL=https://api.yourbackend.com
```

## 📚 Learn More

- **Full Documentation**: See `README.md`
- **Architecture Guide**: See `PROJECT_GUIDE.md`
- **API Docs**: Check your backend documentation
- **Component Library**: Visit [Radix UI](https://www.radix-ui.com/)

## 🎯 Next Actions

**After Setup:**
1. ✅ Login and explore features
2. ✅ Test CRUD operations
3. ✅ Try AI features
4. ✅ Check mobile responsiveness

**For Development:**
1. 🔧 Connect to your backend
2. 🔧 Customize theme colors
3. 🔧 Add new features
4. 🔧 Deploy to production

**For Demo:**
1. 🎬 Prepare demo script
2. 🎬 Test all features
3. 🎬 Show dark mode
4. 🎬 Demonstrate mobile view

## 💡 Pro Tips

1. **Use Dark Mode**: Looks more professional in demos
2. **Start with Farmer Account**: More features to show
3. **Have Images Ready**: For disease detection demo
4. **Prepare Questions**: For chatbot demonstration
5. **Show Responsiveness**: Resize browser during demo

## 🆘 Need Help?

- **Documentation**: Read README.md and PROJECT_GUIDE.md
- **Code Issues**: Check browser console (F12)
- **API Problems**: Mock data fallback is automatic
- **Styling**: All in Tailwind - check theme.css

---

## ⚡ Quick Commands

```bash
# Start development
npm run dev

# Build for production  
npm run build

# Deploy to Vercel
vercel

# Clear cache
rm -rf node_modules/.vite
```

**Happy coding! 🌱**

For questions: Check PROJECT_GUIDE.md or README.md

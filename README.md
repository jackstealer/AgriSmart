<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=32&pause=1000&color=16A34A&center=true&vCenter=true&width=600&lines=🌾+AgriSmart;AI-Powered+Farm+Management;Smart+Agriculture+Platform" alt="AgriSmart" />

<br/>

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

<br/>

[![GitHub stars](https://img.shields.io/github/stars/jackstealer/AgriSmart?style=social)](https://github.com/jackstealer/AgriSmart/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/jackstealer/AgriSmart?style=social)](https://github.com/jackstealer/AgriSmart/network)
[![GitHub issues](https://img.shields.io/github/issues/jackstealer/AgriSmart?color=green)](https://github.com/jackstealer/AgriSmart/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<br/>

> **AgriSmart** is a comprehensive full-stack agricultural management platform that bridges the gap between farmers and buyers through cutting-edge AI technology — combining ML-powered disease detection, real-time market price prediction, live weather intelligence, and an AI chatbot assistant.

[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [🏗️ Architecture](#️-architecture) • [📡 API Docs](#-api-reference) • [🤝 Contributing](#-contributing)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🦠 AI Disease Detection
Upload a photo of your crop and get instant disease diagnosis powered by **PlantVillage ML model** (38 disease classes) with Google Gemini Vision as a fallback. Receive treatment recommendations and prevention tips.

</td>
<td width="50%">

### 📈 ML Price Prediction
Real-time crop price predictions using an ensemble of **XGBoost + Random Forest + Gradient Boosting** models trained on AGMARK data. Achieves **99% R² accuracy** with trend analysis and seasonal insights.

</td>
</tr>
<tr>
<td width="50%">

### 🌦️ Smart Weather Intelligence
Live hyperlocal weather data via OpenWeather API with AI-generated farming advisories — irrigation recommendations, frost alerts, and harvest timing suggestions tailored to your crop.

</td>
<td width="50%">

### 🤖 AI Farming Chatbot
Conversational AI assistant powered by Groq (LLaMA 3.3) answering all your farming queries — crop selection, pest control, market timing, and agronomy best practices in multiple Indian languages.

</td>
</tr>
<tr>
<td width="50%">

### 🛒 Marketplace & Orders
Farmers can list produce, buyers can browse and place orders with full order lifecycle management — from creation to shipment tracking with real-time status updates.

</td>
<td width="50%">

### 💳 Razorpay Payments
Secure payment processing with Razorpay — supports order payments, refunds, and farmer payouts via Razorpay X. Full payment verification with webhook support.

</td>
</tr>
</table>

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Frontend ["🖥️ Frontend — React + Vite (Port 5173)"]
        LP[Landing Page]
        AUTH[Auth — Login/Signup]
        DASH[Dashboard]
        PRICE[Prices Page]
        WEATHER[Weather Page]
        DISEASE[Disease Detection]
        CHAT[AI Chatbot]
        CROPS[Crop Management]
        ORDERS[Orders & Shipments]
    end

    subgraph Backend ["⚙️ Backend — Node.js + Express (Port 5000)"]
        API[REST API]
        AUTH_MW[JWT Middleware]
        UPLOAD[Multer Upload]
        PRICE_STREAM[Price Stream Service]
        subgraph Controllers
            AC[Auth Controller]
            PC[Price Controller]
            WC[Weather Controller]
            DC[Disease Controller]
            CC[Chatbot Controller]
            PAY[Payment Controller]
        end
    end

    subgraph ML ["🧠 ML Server — Flask + TensorFlow (Port 5001)"]
        PRICE_ML[Price Prediction\nRandom Forest Ensemble\n99% R² Accuracy]
        DISEASE_ML[Disease Detection\nMobileNetV2\n38 Disease Classes]
    end

    subgraph External ["🌐 External Services"]
        MONGO[(MongoDB Atlas)]
        CLOUDINARY[Cloudinary\nImage Storage]
        RAZORPAY[Razorpay\nPayments]
        OPENWEATHER[OpenWeather API]
        GROQ[Groq AI\nLLaMA 3.3]
        GEMINI[Google Gemini\nVision AI]
    end

    Frontend -->|/api proxy| Backend
    Backend --> ML
    Backend --> MONGO
    Backend --> CLOUDINARY
    Backend --> RAZORPAY
    Backend --> OPENWEATHER
    Backend --> GROQ
    ML --> GEMINI
```

---

## 🗂️ Project Structure

```
AgriSmart/
├── 📁 agrismart-frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/              # All route pages
│   │   │   ├── components/         # Reusable UI components
│   │   │   ├── context/            # AuthContext
│   │   │   ├── layouts/            # DashboardLayout
│   │   │   └── services/           # API service layer
│   │   ├── i18n/                   # Multi-language support (EN/HI/PA/TA/TE/MR)
│   │   └── styles/                 # CSS + Tailwind config
│   ├── .env.example
│   └── vite.config.js              # Dev proxy → localhost:5000
│
├── 📁 backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── controllers/            # Route handlers
│   │   ├── models/                 # Mongoose schemas
│   │   ├── routes/                 # Express routers
│   │   ├── services/               # Business logic
│   │   ├── middlewares/            # Auth + upload
│   │   ├── config/                 # DB, Cloudinary, Razorpay
│   │   └── utils/
│   └── app.js                      # Express entry point
│
├── 📁 ml-server/                   # Flask ML server
│   ├── app.py                      # Flask API + model loading
│   ├── train_price_model.py        # Train price prediction model
│   ├── price-data/                 # AGMARK crop price dataset
│   └── requirements.txt
│
├── .env.example                    # Environment variables template
├── docker-compose.yml              # Docker setup
└── render.yaml                     # Render.com deployment config
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.x |
| Python | ≥ 3.9 |
| MongoDB | Atlas or Local |

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/jackstealer/AgriSmart.git
cd AgriSmart
```

### 2️⃣ Set Up Environment Variables

```bash
# Backend
cp .env.example backend/.env
# Edit backend/.env with your API keys

# Frontend
cp agrismart-frontend/.env.example agrismart-frontend/.env
# Edit agrismart-frontend/.env
```

<details>
<summary>📋 <strong>Required API Keys (click to expand)</strong></summary>

<br/>

| Variable | Where to Get | Required |
|----------|-------------|----------|
| `MONGO_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Connect | ✅ Yes |
| `JWT_SECRET_KEY` | Any random string | ✅ Yes |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) — Free | ✅ Yes (chatbot) |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) — Free | ⚠️ Optional (disease AI) |
| `OPENWEATHER_API_KEY` | [openweathermap.org](https://home.openweathermap.org/api_keys) — Free | ⚠️ Optional |
| `CLOUD_NAME/KEY/SECRET` | [cloudinary.com](https://cloudinary.com) — Free | ⚠️ Optional (profile images) |
| `RAZORPAY_KEY_ID/SECRET` | [razorpay.com](https://razorpay.com) — Test keys | ⚠️ Optional (payments) |

> **Note:** The app runs without optional APIs using smart fallbacks — simulated weather, auto-generated avatars, rule-based chatbot responses.

</details>

### 3️⃣ Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../agrismart-frontend && npm install

# ML Server
cd ../ml-server && pip install -r requirements.txt
```

### 4️⃣ Train the ML Price Model

```bash
cd ml-server
python train_price_model.py
# ✅ Trains 3 ensemble models | ~99% R² accuracy | Saves to models/
```

### 5️⃣ Start All Services

Open **3 terminals** and run:

```bash
# Terminal 1 — ML Server (Flask)
cd ml-server
python app.py
# 🧠 Running on http://localhost:5001

# Terminal 2 — Backend (Node.js)
cd backend
node app.js
# ⚙️ Running on http://localhost:5000 | MongoDB Connected

# Terminal 3 — Frontend (Vite)
cd agrismart-frontend
npm run dev
# 🖥️ Running on http://localhost:5173
```

**Open [http://localhost:5173](http://localhost:5173) in your browser** 🎉

---

## 📡 API Reference

<details>
<summary>🔐 <strong>Authentication</strong></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/signup` | Register new user (farmer/buyer) | No |
| `POST` | `/api/auth/login` | Login and get JWT token | No |

</details>

<details>
<summary>📈 <strong>Prices</strong></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/prices` | Get latest prices for all crops | No |
| `POST` | `/api/prices/predict` | ML price prediction | Yes |

**Predict payload:**
```json
{
  "crop": "Wheat",
  "state": "Punjab",
  "month": 5,
  "year": 2026,
  "rainfall_mm": 45,
  "temperature_c": 35
}
```

</details>

<details>
<summary>🌦️ <strong>Weather</strong></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/weather/current?lat=&lng=` | Live weather + AI advisory | Yes |

</details>

<details>
<summary>🦠 <strong>Disease Detection</strong></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/disease/detect` | Upload crop image for diagnosis | Yes |

**Request:** `multipart/form-data` with field `image`

</details>

<details>
<summary>🤖 <strong>Chatbot</strong></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/chatbot/message` | Send message to AI assistant | Yes |

</details>

<details>
<summary>🛒 <strong>Crops, Orders & Payments</strong></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET/POST` | `/api/crops` | List / create crops | Yes |
| `GET/POST` | `/api/orders` | List / create orders | Yes |
| `POST` | `/api/payment/create-order` | Create Razorpay order | Yes |
| `POST` | `/api/payment/verify` | Verify payment signature | Yes |
| `POST` | `/api/payment/refund` | Process refund | Yes |

</details>

---

## 🌍 Multi-Language Support

AgriSmart supports **6 Indian languages** on the signup/login screens:

| Language | Code | Script |
|----------|------|--------|
| English | `en` | Latin |
| हिंदी | `hi` | Devanagari |
| ਪੰਜਾਬੀ | `pa` | Gurmukhi |
| தமிழ் | `ta` | Tamil |
| తెలుగు | `te` | Telugu |
| मराठी | `mr` | Devanagari |

---

## 🐳 Docker Deployment

```bash
# Start all services with Docker Compose
docker-compose up --build

# Services:
# Frontend → http://localhost:5173
# Backend  → http://localhost:5000
# ML Server → http://localhost:5001
```

---

## 🔧 Tech Stack

<table>
<tr>
<th>Layer</th>
<th>Technology</th>
<th>Purpose</th>
</tr>
<tr>
<td><strong>Frontend</strong></td>
<td>React 18, Vite, Tailwind CSS, shadcn/ui, Recharts, Framer Motion</td>
<td>UI, routing, data visualization, animations</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>Node.js, Express.js, Mongoose, Multer, dotenvx</td>
<td>REST API, auth, file uploads</td>
</tr>
<tr>
<td><strong>Database</strong></td>
<td>MongoDB Atlas</td>
<td>User data, crops, orders, prices, shipments</td>
</tr>
<tr>
<td><strong>ML Server</strong></td>
<td>Python, Flask, TensorFlow 2.x, scikit-learn, XGBoost, pandas</td>
<td>Price prediction, disease detection</td>
</tr>
<tr>
<td><strong>AI APIs</strong></td>
<td>Groq (LLaMA 3.3), Google Gemini Vision</td>
<td>Chatbot, disease AI analysis</td>
</tr>
<tr>
<td><strong>External</strong></td>
<td>Cloudinary, Razorpay, OpenWeather</td>
<td>Media storage, payments, weather</td>
</tr>
<tr>
<td><strong>Auth</strong></td>
<td>JWT + bcrypt</td>
<td>Stateless authentication</td>
</tr>
</table>

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# 1. Fork the repo and create your branch
git checkout -b feature/amazing-feature

# 2. Make your changes and commit
git commit -m "feat: add amazing feature"

# 3. Push and open a Pull Request
git push origin feature/amazing-feature
```

**Please follow:**
- [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- ESLint rules (run `npm run lint` before committing)
- Add tests for new backend routes

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<div align="center">

**Atul Raj**

[![GitHub](https://img.shields.io/badge/GitHub-jackstealer-181717?style=for-the-badge&logo=github)](https://github.com/jackstealer)

<br/>

*Built with ❤️ for Indian farmers*

<br/>

⭐ **Star this repo if you find it useful!** ⭐

</div>

# AgriSmart Backend (Smart Crop Intelligence System)

Node/Express API for AgriSmart’s Smart Crop Intelligence System (SCIS). It powers authentication, crop listings, marketplace orders, shipment tracking, live price simulation, weather insights, disease detection stubs, and a lightweight rule-based chatbot.

## Tech Stack
- Node.js (ES modules) + Express 5
- MongoDB with Mongoose
- JWT auth with role-based guards (`farmer`, `buyer`)
- Multer in-memory uploads + Cloudinary storage
- Axios for external API calls (OpenWeather) with simulated fallbacks

## Project Structure
- `app.js` – Express app, CORS, routes, health check, starts price stream.
- `src/config` – DB connection, env loader, Cloudinary config, Pathway placeholders.
- `src/controllers` – Route handlers for auth, crops, orders, shipments, users, weather, prices, disease, chatbot.
- `src/middlewares` – JWT `protect`, role `authorize`, and file upload filter.
- `src/models` – Mongoose schemas for users, crops, orders, shipments, prices, alerts, weather, crop health.
- `src/routes` – Route definitions mounted under `/api/*`.
- `src/services` – Weather fetch + heuristic risk, simulated price stream, disease detection stub, chatbot stub.

## Prerequisites
- Node.js ≥ 18 and npm
- MongoDB URI (local or Atlas)
- Cloudinary account for image uploads
- (Optional) OpenWeather API key for real weather data; otherwise simulated values are used.

## Environment Variables
Create `backend/.env` (do not commit secrets). Example:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/agrismart
PORT=5000
JWT_SECRET_KEY=change-me
CLOUD_NAME=your-cloud
CLOUD_API_KEY=xxxx
CLOUD_API_SECRET=xxxx
OPENWEATHER_API_KEY=xxxx          # optional; enables live weather fetch
```

## Quick Start
1) `cd backend`
2) `npm install`
3) Add the `.env` values above.
4) Run `npm run dev` (nodemon). Server listens on `PORT` (default 5000) and exposes `GET /api/health`.

## API Surface (all routes prefixed with `/api`)
- **Auth (public)**: `POST /auth/signup` (multipart `profileImage` + name, email, password, role), `POST /auth/login`.
- **Users (JWT)**: `GET /users/me`, `PATCH /users/me`, `PATCH /users/upload-profile` (multipart `profileImage`).
- **Crops (JWT)**: `POST /crops` (farmer), `GET /crops` (farmer sees own; others see available), `GET /crops/:id`, `PUT /crops/:id` (farmer owner), `DELETE /crops/:id` (farmer owner).
- **Orders (JWT)**: `POST /orders` (buyer), `GET /orders` (buyer: own orders; farmer: orders for their crops), `GET /orders/:id`, `PATCH /orders/:id/status` (buyer).
- **Shipments (JWT)**: `POST /shipments` (farmer), `GET /shipments`, `GET /shipments/:id`, `PATCH /shipments/:id/status` (farmer). Pathway live-tracking hooks are placeholders.
- **Weather (JWT)**: `GET /weather/current?lat=<>&lng=<>` (fetch + AI risk), `GET /weather/latest`.
- **Prices (JWT)**: `GET /prices?cropName=&limit=`, `POST /prices/simulate-tick` (manual tick; automatic stream runs every 5s on server start).
- **Disease (JWT, farmer)**: `POST /disease/detect` (cropId, imageUrl), `GET /disease/my`.
- **Chatbot (JWT)**: `POST /chatbot/ask` (message) – rule-based replies, ready to swap with LLM.

All protected endpoints expect `Authorization: Bearer <token>` from login/signup.

## Development Notes
- Price predictions are simulated; `startPriceStream()` seeds data continuously. Stop it by calling `stopPriceStream()` in `src/services/priceStreamService.js` if needed.
- Weather, disease detection, and chatbot services include TODOs marked for model integrations—safe to stub or replace with real providers.

## Scripts
- `npm run dev` – start server with nodemon.
- `npm test` – placeholder.

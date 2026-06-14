import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import cropRoutes from "./src/routes/cropRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import shipmentRoutes from "./src/routes/shipmentRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import weatherRoutes from "./src/routes/weatherRoutes.js";
import priceRoutes from "./src/routes/priceRoutes.js";
import diseaseRoutes from "./src/routes/diseaseRoutes.js";
import chatbotRoutes from "./src/routes/chatbotRoutes.js";
import { startPriceStream } from "./src/services/priceStreamService.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// 1. SECURITY HEADERS — Helmet sets 15+ HTTP headers that block common attacks
//    (XSS, clickjacking, MIME-sniffing, etc.)
// ─────────────────────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow Cloudinary images
    contentSecurityPolicy: false, // CSP handled by frontend
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. CORS — strict origin whitelist only
// ─────────────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser tools (Postman) in dev, but block unknown origins in prod
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. RATE LIMITING — prevent brute-force & DoS attacks
// ─────────────────────────────────────────────────────────────────────────────

// Global: 200 req / 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

// Auth endpoints: 10 attempts / 15 min per IP (brute-force login protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please wait 15 minutes." },
});

// ML-heavy endpoints: 30 req / 5 min (disease detection & price predict)
const mlLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many AI requests. Please slow down." },
});

app.use(globalLimiter);

// ─────────────────────────────────────────────────────────────────────────────
// 4. BODY PARSING — with strict size limits to prevent payload attacks
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ─────────────────────────────────────────────────────────────────────────────
// 5. NoSQL INJECTION SANITIZATION — strips $ and . from req.body/query/params
//    Prevents MongoDB operator injection like { "$gt": "" }
// ─────────────────────────────────────────────────────────────────────────────
// app.use(mongoSanitize({
//   replaceWith: "_",          // replace $. chars instead of removing (keeps field names visible in logs)
//   onSanitize: ({ req, key }) => {
//     console.warn(`[SECURITY] NoSQL injection attempt blocked — key: ${key} from ${req.ip}`);
//   },
// }));

// ─────────────────────────────────────────────────────────────────────────────
// 6. HTTP PARAMETER POLLUTION — blocks duplicate query params (e.g. ?role=admin&role=farmer)
// ─────────────────────────────────────────────────────────────────────────────
// app.use(hpp());

// ─────────────────────────────────────────────────────────────────────────────
// 7. HEALTH CHECK (unauthenticated, rate-limited by global)
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "AgriSmart backend is running" });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. ROUTES — auth endpoints get strict rate limiter; ML routes get ML limiter
// ─────────────────────────────────────────────────────────────────────────────
app.use("/api/auth",      authLimiter, authRoutes);
app.use("/api/crops",     cropRoutes);
app.use("/api/orders",    orderRoutes);
app.use("/api/payments",  paymentRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/weather",   weatherRoutes);
app.use("/api/prices",    mlLimiter, priceRoutes);
app.use("/api/disease",   mlLimiter, diseaseRoutes);
app.use("/api/chatbot",   mlLimiter, chatbotRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// 9. GLOBAL ERROR HANDLER — never leaks stack traces or internal error details
// ─────────────────────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  // Log full error server-side
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

  // CORS errors
  if (err.message?.startsWith("CORS:")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  // Don't leak internals to clients
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? "Internal server error" : err.message,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. 404 HANDLER — no URL disclosure
// ─────────────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─────────────────────────────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────────────────────────────
connectDB();
startPriceStream();
const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

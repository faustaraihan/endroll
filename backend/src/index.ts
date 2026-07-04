import "dotenv/config";
import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { apiRouter } from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== "production";

// ── Security headers ──
app.use(helmet({
  crossOriginResourcePolicy: { policy: isDev ? "cross-origin" : "same-origin" },
  contentSecurityPolicy: isDev ? false : undefined,
}));

// ── Compression ──
app.use(compression());

// ── CORS ──
const allowedOrigins = isDev
  ? ["http://localhost:5173", "http://localhost:3000"]
  : [process.env.FRONTEND_URL || "https://endroll.app"].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ── Rate limiting ──
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.use("/api", limiter);

// TMDB search has its own stricter rate limit (10 req/min per IP through our server)
const tmdbLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Search rate limit exceeded. Try again later." },
});

app.use("/api/titles/search", tmdbLimiter);

// ── Body parser ──
app.use(express.json({ limit: "1mb" }));

// ── Health check ──
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "endroll-api", environment: isDev ? "development" : "production" });
});

// ── API routes ──
app.use("/api", apiRouter);

// ── 404 handler ──
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ── Error handler ──
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);

  if (err.message?.includes("Not allowed by CORS")) {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🎬 Endroll API running on port ${PORT} [${isDev ? "dev" : "prod"}]`);
});

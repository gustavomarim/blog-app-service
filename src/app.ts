import cookieParser from "cookie-parser";
import express, { Express, NextFunction, Request, Response } from "express";
import session from "express-session";
import passport from "passport";

import "./config/dbConfig";

import cors from "cors";
import adminRoutes from "./routes/admin";
import categoryRoutes from "./routes/category";
import postRoutes from "./routes/post";
import userRoutes from "./routes/user";
import AuthService from "./services/AuthService";
import JwtAuthService from "./services/JwtAuthService";

const corsOptions = {
  origin: function (origin: any, callback: any) {
    console.log(`🌐 CORS - Origin recebido: ${origin || "undefined"}`);

    const allowedOrigins = [
      process.env.FRONT_END_BASE_URL,
      "http://localhost:3000",
      "http://localhost:5173", // Vite default
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "https://blog-app-nextjs-weld.vercel.app", // Backup hardcoded
    ].filter(Boolean); // Remove valores undefined/null

    console.log(`🔍 Origins permitidos:`, allowedOrigins);

    if (!origin || allowedOrigins.includes(origin)) {
      console.log("✅ CORS - Origin permitido");
      callback(null, true);
    } else {
      console.log("❌ CORS - Origin não permitido:", origin);
      callback(new Error("Não permitido pelo CORS"));
    }
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-CSRF-Token",
    "Cache-Control",
    "Cookie",
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
};

export const COOKIE_MAX_AGE = 3600000; // 1 hora em milissegundos

const app: Express = express();

app.use(cors(corsOptions));
app.use(cookieParser()); // Adicionar cookie-parser antes do express.json()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CONFIGURATIONS
const authService = new AuthService(passport);
authService.configure();

const jwtAuthService = new JwtAuthService(passport);
jwtAuthService.configure();

// SESSIONS
console.log("🍪 Configurando sessões...");

// Detectar se está em produção baseado na URL do frontend
const isProduction =
  process.env.FRONT_END_BASE_URL?.includes("vercel.app") ||
  process.env.FRONT_END_BASE_URL?.includes("render.com") ||
  process.env.NODE_ENV === "production";

console.log("🔍 Modo de produção detectado:", {
  isProduction,
  frontendUrl: process.env.FRONT_END_BASE_URL,
  nodeEnv: process.env.NODE_ENV || "undefined",
});

if (!process.env.SESSION_SECRET) {
  console.error("❌ ERRO CRÍTICO: SESSION_SECRET não definido!");
  if (isProduction) {
    process.exit(1);
  }
}

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // HTTPS obrigatório em produção
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
      sameSite: isProduction ? "none" : "lax", // "none" permite cross-site em HTTPS
    },
    name: "connect.sid",
  }) as unknown as express.RequestHandler
);

console.log("✅ Sessões configuradas:", {
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  domain: isProduction ? process.env.COOKIE_DOMAIN : "default",
});

// MIDDLEWARES
app.use(passport.initialize() as unknown as express.RequestHandler);
app.use(passport.session() as express.RequestHandler);

// Middleware de debug e segurança para cookies e headers
app.use((request: Request, response: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[${new Date().toISOString()}] ${request.method} ${request.path}`
    );
    console.log("Headers:", {
      authorization: request.headers.authorization?.substring(0, 20) + "...",
      cookie: request.headers.cookie?.substring(0, 50) + "...",
      origin: request.headers.origin,
    });
    console.log("Cookies:", request.cookies);
  }

  // Adicionar headers de segurança para logout
  response.header("Cache-Control", "no-cache, no-store, must-revalidate");
  response.header("Pragma", "no-cache");
  response.header("Expires", "0");

  response.locals.user = request.user || null;
  next();
});

// ROUTES
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);

const PORT: number = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT} => http://localhost:${PORT}`);
});

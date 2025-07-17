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
    // Em desenvolvimento, permitir requests sem origin (ex: mobile apps, Postman)
    const allowedOrigins = [
      process.env.FRONT_END_BASE_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:5173", // Vite default
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
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
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production" ? true : false,
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      domain:
        process.env.NODE_ENV === "production"
          ? process.env.COOKIE_DOMAIN
          : undefined,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }) as unknown as express.RequestHandler
);

// MIDDLEWARES
app.use(passport.initialize() as unknown as express.RequestHandler);
app.use(passport.session() as express.RequestHandler);

// Middleware de debug para cookies e headers
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

import cookieParser from "cookie-parser";
import express, { Express, NextFunction, Request, Response } from "express";
import session from "express-session";
import passport from "passport";

import "./config/dbConfig";

import cors from "cors";
import { corsMiddleware } from "./config/corsConfig";
import adminRoutes from "./routes/admin";
import categoryRoutes from "./routes/category";
import postRoutes from "./routes/post";
import userRoutes from "./routes/user";
import AuthService from "./services/AuthService";
import JwtAuthService from "./services/JwtAuthService";

const corsOptions = {
  origin: process.env.FRONT_END_BASE_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // permite que o frontend inclua credenciais (cookies) nas solicitações
};

export const COOKIE_MAX_AGE = 3600000; // 1 hora em milissegundos

const app: Express = express();

app.use(corsMiddleware);
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
      // secure: true,
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      // sameSite: "none"
    },
  }) as unknown as express.RequestHandler
);

// MIDDLEWARES
app.use(passport.initialize() as unknown as express.RequestHandler);
app.use(passport.session() as express.RequestHandler);

app.use((request: Request, response: Response, next: NextFunction) => {
  response.locals.user = request.user || null;
  next();
});

// ROUTES
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/posts", postRoutes);
app.use("/categories", categoryRoutes);

const PORT: number = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT} => http://localhost:${PORT}`);
});

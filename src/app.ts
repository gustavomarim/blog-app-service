import express, { Express, NextFunction, Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import configurePassport from "./config/auth";

import "./config/dbConfig";
import "./models/Category";
import "./models/Post";
import "./models/User";

import cors from "cors";
import { corsMiddleware } from "./config/corsConfig";
import admin from "./routes/admin";
import category from "./routes/category";
import home from "./routes/home";
import post from "./routes/post";
import user from "./routes/user";

const corsOptions = {
  origin: process.env.FRONT_END_BASE_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Isso permite que o frontend inclua credenciais (cookies) nas solicitações
};

const ONE_HOUR_IN_MILLISECONDS = 3600000;

const app: Express = express();

app.use(corsMiddleware);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CONFIGURAÇÕES
configurePassport(passport);

// Sessão
app.use(
  session({
    secret: "blogapp",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: ONE_HOUR_IN_MILLISECONDS, // Tempo de vida do cookie em milissegundos (opcional)
      sameSite: "none",
    },
  })
);

// MIDDLEWARES
app.use(passport.initialize());
app.use(passport.session());

app.use((request: Request, response: Response, next: NextFunction) => {
  response.locals.user = request.user || null;
  next();
});

app.use(home);
app.use(user);
app.use(admin);
app.use(post);
app.use(category);

const PORT: number = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT} => http://localhost:${PORT}`);
});

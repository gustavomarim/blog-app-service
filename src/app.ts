import bodyParser from 'body-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import configurePassport from './config/auth';

require('./config/dbConfig');
require('./models/User');
require('./models/Post');
require('./models/Category');

const corsOptions = {
  origin: process.env.FRONT_END_BASE_URL,
  credentials: true, // Isso permite que o frontend inclua credenciais (cookies) nas solicitações
};

const ONE_HOUR_IN_MILLISECONDS = 3600000

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// CONFIGURAÇÕES
configurePassport(passport);

// Sessão
app.use(
  session({
    secret: "blogapp",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", 
      httpOnly: true,
      maxAge: ONE_HOUR_IN_MILLISECONDS, // Tempo de vida do cookie em milissegundos (opcional)
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

const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT} => http://localhost:${PORT}`);
});

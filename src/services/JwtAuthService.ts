import { Request } from "express";
import { PassportStatic } from "passport";
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptionsWithSecret,
  VerifiedCallback,
} from "passport-jwt";
import User from "../models/User";

class JwtAuthService {
  private passport: PassportStatic;

  constructor(passport: PassportStatic) {
    this.passport = passport;
  }

  public configure(): void {
    console.log("JwtAuthService configured");
    this.configureJwtStrategy();
  }

  private configureJwtStrategy(): void {
    // Função extratora customizada para cookies (seguindo a documentação)
    const cookieExtractor = function (req: Request) {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies["jwt"];
      }
      return token;
    };

    // Função que verifica múltiplas fontes: Bearer token e cookies
    const multiExtractor = function (req: Request) {
      return (
        ExtractJwt.fromAuthHeaderAsBearerToken()(req) || cookieExtractor(req)
      );
    };

    const options: StrategyOptionsWithSecret = {
      jwtFromRequest: multiExtractor,
      secretOrKey: process.env.JWT_SECRET || "secret",
      issuer: process.env.JWT_ISSUER || "blog-app",
      audience: process.env.JWT_AUDIENCE || "blog-app-users",
    };

    this.passport.use(new JwtStrategy(options, this.verifyJwt.bind(this)));
  }

  private async verifyJwt(jwt_payload: any, done: VerifiedCallback) {
    try {
      const user = await User.findById(jwt_payload.id || jwt_payload.sub);

      if (!user) {
        return done(null, false, { message: "Usuário não encontrado" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
}

export default JwtAuthService;

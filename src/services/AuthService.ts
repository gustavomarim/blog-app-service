import * as bcrypt from "bcryptjs";
import { PassportStatic } from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/User";

class AuthService {
  private passport: PassportStatic;

  constructor(passport: PassportStatic) {
    this.passport = passport;
  }

  public configure(): void {
    this.configureLocalStrategy();
    this.configureSerializers();
  }

  private configureLocalStrategy(): void {
    this.passport.use(
      new LocalStrategy(
        { usernameField: "email", passwordField: "password" },
        this.authenticateUser.bind(this)
      )
    );
  }

  private async authenticateUser(
    email: string,
    password: string,
    done: any
  ): Promise<void> {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return done(null, false, { message: "Usuário não encontrado" });
      }

      const isMatchPassword = await this.comparePassword(
        password,
        user.password
      );

      if (!isMatchPassword) {
        return done(null, false, { message: "Senha inválida" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }

  private configureSerializers(): void {
    this.passport.serializeUser((user: any, done: any) => {
      return done(null, user.id);
    });

    this.passport.deserializeUser(async (id: any, done: any) => {
      try {
        const user = await User.findById(id);
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    });
  }

  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

export default AuthService;

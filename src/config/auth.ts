import * as bcrypt from 'bcryptjs';
import { PassportStatic } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User';

const configurePassport = (passport: PassportStatic): void => {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email: string, password: string, done: any) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: 'Usuário não encontrado' });
          }

          const isMatchPassword = await bcrypt.compare(password, user.password);

          if (!isMatchPassword) {
            return done(null, false, { message: 'Senha inválida' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  passport.serializeUser((user: any, done: any) => {
    return done(null, user.id);
  });

  passport.deserializeUser(async (id: any, done: any) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

export default configurePassport;

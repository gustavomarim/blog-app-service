import * as bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import User from "../models/User";

export default {
  async register(request: Request, response: Response) {
    const { name, email, password, confirmPassword } = request.body;

    const userEmail = await User.findOne({ email });

    if (password !== confirmPassword) {
      return response.status(400).json({ error: "As senhas devem ser iguais" });
    }

    if (userEmail) {
      return response
        .status(400)
        .json("Já existe uma conta com este e-mail no nosso sistema");
    } else {
      const newUser = await User.create({
        name,
        email,
        password,
      });

      // 'Hasheando' a senha
      bcrypt.genSalt(10, (_error: any, salt: any) => {
        bcrypt.hash(newUser.password, salt, (err: any, hash: any) => {
          if (err) {
            return response.json({
              error: "Houve um erro durante o salvamento do usuário",
            });
          } else {
            newUser.password = hash;

            newUser.save();
          }
        });
      });

      if (newUser) return response.json(newUser);
    }
  },

  login(request: Request, response: Response, next: NextFunction) {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        // Erro interno do servidor
        return response.status(500).json({
          message: "Erro interno do servidor",
          error: err.message,
        });
      }
      if (!user) {
        // Credenciais inválidas
        return response.status(401).json({
          message: "Credenciais inválidas",
          error: info.message,
        });
      }
      // Login bem-sucedido
      request.logIn(user, (err) => {
        if (err) {
          return response.status(500).json({
            message: "Erro interno do servidor",
            error: err.message,
          });
        }
        return response.status(200).json({
          message: "Login bem-sucedido",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
          },
        });
      });
    })(request, response, next);
  },

  logout(request: Request, response: Response, next: NextFunction) {
    request.logout((err: any) => {
      if (err) return next(err);
    });

    return response.status(200).json("Logout realizado com sucesso!");
  },
};

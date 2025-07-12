import * as bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import usersModel from "../models/User";

export class UserController {
  private userModel: typeof usersModel;

  constructor(userModel: typeof usersModel = usersModel) {
    this.userModel = userModel;
  }

  public async createUser(request: Request, response: Response) {
    const { name, email, password, confirmPassword } = request.body;

    if (password !== confirmPassword) {
      return response.status(400).json({
        error: "As senhas devem ser iguais",
      });
    }

    const userEmail = await this.userModel.findOne({ email });

    if (userEmail) {
      return response.status(400).json({
        error: "Já existe uma conta com este e-mail no nosso sistema",
      });
    }

    const newUser = await this.userModel.create({
      name,
      email,
      password,
    });

    bcrypt.genSalt(10, (error: unknown, salt: string) => {
      bcrypt.hash(newUser.password, salt, (err: unknown, hash: string) => {
        if (err) {
          return response.json({
            error: "Houve um erro durante o salvamento do usuário",
          });
        }

        newUser.password = hash;

        newUser.save();
      });
    });

    if (newUser) return response.json(newUser);
  }

  public async login(request: Request, response: Response, next: NextFunction) {
    try {
      await passport.authenticate(
        "local",
        (err: unknown, user: any, info: any) => {
          if (err) {
            return response.status(500).json({
              message: "Erro interno do servidor",
              error: err,
            });
          }

          if (!user) {
            return response.status(401).json({
              message: "Credenciais inválidas",
            });
          }

          request.login(user, (error: unknown) => {
            if (error) {
              return response.status(500).json({
                message: "Erro interno do servidor",
                error: error,
              });
            }

            return response.status(200).json({
              message: "Login bem-sucedido",
              user: {
                id: user.id,
              },
            });
          });
        }
      )(request, response, next);
    } catch (error) {
      return response.status(500).json({
        message: "Erro interno do servidor",
        error: error,
      });
    }
  }

  public async logout(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    request.logout(function (error: unknown) {
      if (error) return next(new Error("Erro ao realizar logout."));

      return response.status(200).json({
        message: "Logout realizado com sucesso!",
      });
    });
  }
}

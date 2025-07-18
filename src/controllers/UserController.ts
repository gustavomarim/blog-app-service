import * as bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { COOKIE_MAX_AGE } from "../app";
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

  // Método para gerar JWT após login bem-sucedido
  public async generateJwtToken(request: Request, response: Response) {
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

          // Gerar JWT token
          const payload = {
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin,
          };

          const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn: "1h",
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE,
          });

          // Definir cookie com o JWT (opcional)
          response.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            maxAge: COOKIE_MAX_AGE, // 1 hora
            path: "/",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            domain:
              process.env.NODE_ENV === "production"
                ? process.env.COOKIE_DOMAIN
                : undefined,
          });

          return response.status(200).json({
            message: "Login bem-sucedido",
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              isAdmin: user.isAdmin,
            },
            token: token,
          });
        }
      )(request, response);
    } catch (error) {
      return response.status(500).json({
        message: "Erro interno do servidor",
        error: error,
      });
    }
  }

  // Método para verificar JWT
  async jwtLogin(request: Request, response: Response, next: NextFunction) {
    passport.authenticate(
      "jwt",
      { session: false },
      (err: unknown, user: any, info: any) => {
        if (err) {
          return response.status(500).json({
            message: "Erro interno do servidor",
            error: err,
          });
        }

        if (!user) {
          return response.status(401).json({
            message: "Token inválido ou expirado",
          });
        }

        return response.status(200).json({
          message: "Autenticação JWT bem-sucedida",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
          },
        });
      }
    )(request, response, next);
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

          // Gerar JWT token para manter compatibilidade
          const payload = {
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin,
          };

          const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn: "1h",
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE,
          });

          // Definir cookie com o JWT
          response.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            maxAge: COOKIE_MAX_AGE, // 1 hora
            path: "/",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            domain:
              process.env.NODE_ENV === "production"
                ? process.env.COOKIE_DOMAIN
                : undefined,
          });

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
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
              },
              token: token,
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
    try {
      // Obter informações do usuário antes do logout (para logs)
      const user = request.user as any;
      const userInfo = user
        ? {
            id: user._id || user.id,
            email: user.email,
            isAdmin: user.isAdmin,
          }
        : null;

      // Logout da sessão Passport
      request.logout(function (error: unknown) {
        if (error) {
          console.error("Erro no logout de sessão:", error);
          return response.status(500).json({
            message: "Erro interno durante logout",
            error: "Falha ao invalidar sessão",
          });
        }

        // Limpeza segura de TODOS os cookies de autenticação
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          domain:
            process.env.NODE_ENV === "production"
              ? process.env.COOKIE_DOMAIN
              : undefined,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        } as const;

        // Limpar cookie JWT
        response.clearCookie("jwt", cookieOptions);

        // Limpar cookie de sessão
        response.clearCookie("connect.sid", cookieOptions);

        // Limpar possíveis outros cookies relacionados
        response.clearCookie("session", cookieOptions);
        response.clearCookie("auth", cookieOptions);

        // Log de segurança
        if (process.env.NODE_ENV !== "production") {
          console.log(`[LOGOUT] ${new Date().toISOString()} - Usuário:`, {
            id: userInfo?.id || "Anônimo",
            email: userInfo?.email || "Não identificado",
            ip: request.ip || request.socket.remoteAddress,
            userAgent: request.headers["user-agent"]?.substring(0, 100),
          });
        }

        // Invalidar sessão se existir
        if (request.session) {
          request.session.destroy((err) => {
            if (err) {
              console.error("Erro ao destruir sessão:", err);
            }
          });
        }

        return response.status(200).json({
          message: "Logout realizado com sucesso!",
          timestamp: new Date().toISOString(),
          success: true,
        });
      });
    } catch (error) {
      console.error("Erro crítico no logout:", error);
      return response.status(500).json({
        message: "Erro interno do servidor durante logout",
        error: "Falha crítica no processo de logout",
      });
    }
  }

  public async validateJwt(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      await passport.authenticate(
        "jwt",
        { session: false },
        (err: unknown, user: any, info: any) => {
          if (err) {
            return response.status(500).json({
              message: "Erro interno do servidor",
              error: err,
            });
          } else if (!user) {
            return response.status(401).json({
              message: "Token inválido ou expirado",
            });
          } else {
            return response.status(200).json({
              message: "JWT válido",
            });
          }
        }
      )(request, response, next);
    } catch (error) {
      console.error("Erro ao validar JWT:", error);
      return response.status(500).json({
        message: "Erro ao validar JWT",
        error: error,
      });
    }
  }
}

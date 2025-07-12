import { NextFunction, Request, Response } from "express";
import { Document } from "mongoose";

declare global {
  namespace Express {
    interface User extends Document {
      isAdmin: boolean;
    }
  }
}

class AuthorizationService {
  private static readonly ERROR_MESSAGES = {
    ADMIN_REQUIRED: "Você precisa estar logado com uma conta de Administrador.",
    UNAUTHORIZED: "Você precisa estar autenticado para acessar este recurso.",
    FORBIDDEN: "Você não tem permissão para acessar este recurso.",
    INTERNAL_ERROR: "Erro interno no servidor",
  };

  public static isAdmin() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        if (request.isAuthenticated() && request.user?.isAdmin) {
          return next();
        }

        return response.status(401).json({
          error: AuthorizationService.ERROR_MESSAGES.ADMIN_REQUIRED,
        });
      } catch (error) {
        console.error("Erro no middleware isAdmin:", error);
        return response.status(500).json({
          error: AuthorizationService.ERROR_MESSAGES.INTERNAL_ERROR,
        });
      }
    };
  }

  public static isAuthenticated() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        if (request.isAuthenticated()) {
          return next();
        }

        return response.status(401).json({
          error: AuthorizationService.ERROR_MESSAGES.UNAUTHORIZED,
        });
      } catch (error) {
        console.error("Erro no middleware isAuthenticated:", error);
        return response.status(500).json({
          error: AuthorizationService.ERROR_MESSAGES.INTERNAL_ERROR,
        });
      }
    };
  }

  public static hasPermission(checkFunction: (user: any) => boolean) {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        if (request.isAuthenticated() && checkFunction(request.user)) {
          return next();
        }

        return response.status(403).json({
          error: AuthorizationService.ERROR_MESSAGES.FORBIDDEN,
        });
      } catch (error) {
        console.error("Erro no middleware hasPermission:", error);
        return response.status(500).json({
          error: AuthorizationService.ERROR_MESSAGES.INTERNAL_ERROR,
        });
      }
    };
  }

  public static checkIsAdmin(user: any): boolean {
    return user && user.isAdmin === true;
  }
}

export default AuthorizationService;

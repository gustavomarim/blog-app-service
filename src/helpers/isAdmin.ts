import { NextFunction, Request, Response } from "express";

import { Document } from "mongoose";

declare global {
  namespace Express {
    interface User extends Document {
      isAdmin: boolean;
    }
  }
}

export const isAdmin = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    if (request.isAuthenticated() && request.user.isAdmin) {
      return next();
    }

    console.error("Acesso proibido para o usuário:", request.user);
    return response.status(403).json({
      error:
        "Acesso proibido. Você precisa estar logado com uma conta de Administrador.",
    });
  } catch (error) {
    console.error("Erro no middleware isAdmin:", error);
    return response.status(500).json({ error: "Erro interno do servidor." });
  }
};

import { NextFunction, Request, Response } from "express";

import { Document } from "mongoose";

declare global {
  namespace Express {
    interface User extends Document {
      isAdmin: boolean;
    }
  }
}

const ERROR_MESSAGE =
  "Você precisa estar logado com uma conta de Administrador.";

export const isAdmin = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    if (request.isAuthenticated() && request.user?.isAdmin) {
      return next();
    }

    return response.status(401).json({ error: ERROR_MESSAGE });
  } catch (error) {
    console.error("Erro no middleware isAdmin:", error);

    return response.status(500).json({ error: "Erro interno no servidor" });
  }
};

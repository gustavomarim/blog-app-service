import { NextFunction, Request, Response } from 'express';

import { Document } from 'mongoose';

declare global {
  namespace Express {
    interface User extends Document {
      isAdmin: boolean;
    }
  }
}

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }

  return res.json('Você precisa estar logado com uma conta de Administrador.');
};

import { NextFunction, Request, Response } from 'express';
import { UserProps } from '../models/User';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as UserProps;

  if (req.isAuthenticated() && user.isAdmin === 1) {
    return next();
  }

  return res.json('Você precisa estar logado com uma conta de Administrador.');
};

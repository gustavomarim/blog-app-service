import { NextFunction, Request, Response } from "express";

export const corsMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  response.header(
    "Access-Control-Allow-Origin",
    process.env.FRONT_END_BASE_URL || "*"
  );
  response.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  response.header("Access-Control-Allow-Credentials", "true");

  if (request.method === "OPTIONS") {
    response.sendStatus(200);
  } else {
    next();
  }
};

import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "../controllers/UserController";
export class UserRoutes {
  private router: Router;
  private userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/register", this.createUser.bind(this));
    this.router.post("/login", this.login.bind(this));
    this.router.get("/logout", this.logout.bind(this));
  }

  private async createUser(request: Request, response: Response) {
    try {
      return await this.userController.createUser(request, response);
    } catch (error) {
      console.error(error, "Erro ao criar usuário");
    }
  }

  private async login(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      return await this.userController.login(request, response, next);
    } catch (error) {
      console.error(error, "Erro ao fazer login");
    }
  }

  private async logout(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      return await this.userController.logout(request, response, next);
    } catch (error) {
      console.error(error, "Erro ao fazer logout");
    }
  }

  public getRouter() {
    return this.router;
  }
}

const userRoutes = new UserRoutes();

export default userRoutes.getRouter();

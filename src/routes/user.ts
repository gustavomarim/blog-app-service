import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
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
    // Rotas essenciais de autenticação
    this.router.post("/register", this.createUser.bind(this));
    this.router.post("/login", this.login.bind(this)); // Híbrido: sessão + JWT
    this.router.get("/logout", this.logout.bind(this));

    // Rota de perfil unificada (usuário comum + admin)
    this.router.get(
      "/profile",
      passport.authenticate("jwt", { session: false }),
      this.getProfile.bind(this)
    );
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

  // Rota de perfil unificada (usuário comum + admin)
  private async getProfile(request: Request, response: Response) {
    try {
      const user = request.user as any;

      // Resposta base do usuário
      const userProfile = {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      // Se for admin, incluir informações administrativas
      if (user.isAdmin) {
        return response.status(200).json({
          message: "Perfil do administrador autenticado",
          user: userProfile,
          adminFeatures: {
            canManagePosts: true,
            canManageCategories: true,
            canManageUsers: true,
            dashboardAccess: true,
          },
          type: "admin",
        });
      }

      // Se for usuário comum
      return response.status(200).json({
        message: "Perfil do usuário autenticado",
        user: userProfile,
        type: "user",
      });
    } catch (error) {
      console.error(error, "Erro ao obter perfil");
      return response.status(500).json({
        error: "Erro interno do servidor",
      });
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

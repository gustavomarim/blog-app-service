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
    // Rotas de autenticação por sessão (existentes)
    this.router.post("/register", this.createUser.bind(this));
    this.router.post("/login", this.login.bind(this));
    this.router.get("/logout", this.logout.bind(this));

    // Novas rotas JWT
    this.router.post("/jwt-login", this.generateJwtToken.bind(this));
    this.router.get("/jwt-verify", this.jwtLogin.bind(this));
    this.router.get(
      "/profile",
      passport.authenticate("jwt", { session: false }),
      this.getProfile.bind(this)
    );

    // Rota protegida para admins usando JWT
    this.router.get(
      "/admin-profile",
      passport.authenticate("jwt", { session: false }),
      this.getAdminProfile.bind(this)
    );

    // Rota de teste para verificar se JWT está funcionando
    this.router.get(
      "/test-auth",
      passport.authenticate("jwt", { session: false }),
      this.testAuth.bind(this)
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

  private async generateJwtToken(request: Request, response: Response) {
    try {
      return await this.userController.generateJwtToken(request, response);
    } catch (error) {
      console.error(error, "Erro ao gerar token JWT");
    }
  }

  private async jwtLogin(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      return await this.userController.jwtLogin(request, response, next);
    } catch (error) {
      console.error(error, "Erro na autenticação JWT");
    }
  }

  // Rota protegida usando JWT (seguindo a documentação)
  private async getProfile(request: Request, response: Response) {
    try {
      // O usuário já foi autenticado pelo middleware JWT
      const user = request.user as any;

      return response.status(200).json({
        message: "Perfil do usuário autenticado via JWT",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      });
    } catch (error) {
      console.error(error, "Erro ao obter perfil");
      return response.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  private async getAdminProfile(request: Request, response: Response) {
    try {
      const user = request.user as any;

      if (!user.isAdmin) {
        return response.status(403).json({
          error: "Acesso negado: você precisa ser um administrador",
        });
      }

      return response.status(200).json({
        message: "Perfil do administrador autenticado via JWT",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      });
    } catch (error) {
      console.error(error, "Erro ao obter perfil do admin");
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

  private async validateJwt(request: Request, response: Response, next: NextFunction) {
    try {
      return await this.userController.validateJwt(request, response, next);
    } catch (error) {
      console.error(error, "Erro ao validar JWT");
    }
  }

  private async testAuth(request: Request, response: Response) {
    try {
      const user = request.user as any;
      
      return response.status(200).json({
        message: "🎉 Autenticação JWT funcionando perfeitamente!",
        timestamp: new Date().toISOString(),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
        authMethod: "JWT Cookie"
      });
    } catch (error) {
      console.error(error, "Erro no teste de autenticação");
      return response.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  public getRouter() {
    return this.router;
  }
}

const userRoutes = new UserRoutes();

export default userRoutes.getRouter();

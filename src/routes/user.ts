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

    // Rota para verificar status de autenticação (útil pós-logout)
    this.router.get("/auth-status", this.checkAuthStatus.bind(this));
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

  // Verifica status de autenticação sem falhar (útil para verificar pós-logout)
  private async checkAuthStatus(request: Request, response: Response) {
    try {
      // Tentar autenticar sem forçar erro
      passport.authenticate(
        "jwt",
        { session: false },
        (err: unknown, user: any, info: any) => {
          const hasJwtCookie = !!request.cookies?.jwt;
          const hasSessionCookie = !!request.cookies?.["connect.sid"];
          const hasAuthHeader = !!request.headers.authorization;

          if (err) {
            return response.status(200).json({
              authenticated: false,
              reason: "authentication_error",
              cookies: {
                jwt: hasJwtCookie,
                session: hasSessionCookie,
              },
              headers: {
                authorization: hasAuthHeader,
              },
              message: "Erro na autenticação",
            });
          }

          if (!user) {
            return response.status(200).json({
              authenticated: false,
              reason: info?.message || "token_invalid_or_expired",
              cookies: {
                jwt: hasJwtCookie,
                session: hasSessionCookie,
              },
              headers: {
                authorization: hasAuthHeader,
              },
              message: "Usuário não autenticado - logout bem-sucedido",
            });
          }

          // Usuário ainda autenticado
          return response.status(200).json({
            authenticated: true,
            user: {
              id: user._id,
              email: user.email,
              isAdmin: user.isAdmin,
            },
            cookies: {
              jwt: hasJwtCookie,
              session: hasSessionCookie,
            },
            headers: {
              authorization: hasAuthHeader,
            },
            message: "Usuário ainda autenticado",
          });
        }
      )(request, response);
    } catch (error) {
      console.error("Erro ao verificar status de auth:", error);
      return response.status(500).json({
        authenticated: false,
        reason: "internal_error",
        message: "Erro interno ao verificar autenticação",
      });
    }
  }

  public getRouter() {
    return this.router;
  }
}

const userRoutes = new UserRoutes();

export default userRoutes.getRouter();

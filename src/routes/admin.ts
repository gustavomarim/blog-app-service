import { Request, Response, Router } from "express";
import passport from "passport";
import { CategoryController } from "../controllers/CategoryController";

export class AdminRoutes {
  private router: Router;
  private categoryController: CategoryController;

  constructor() {
    this.router = Router();
    this.categoryController = new CategoryController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // rota protegida para buscar todas as categorias
    this.router.get(
      "/categories",
      passport.authenticate("jwt", { session: false }),
      this.verifyAdmin.bind(this),
      this.getAllCategories.bind(this)
    );

    // rota protegida para buscar o dashboard do administrador
    this.router.get(
      "/dashboard",
      passport.authenticate("jwt", { session: false }),
      this.verifyAdmin.bind(this),
      this.getDashboard.bind(this)
    );
  }

  private verifyAdmin(request: Request, response: Response, next: any) {
    const user = request.user as any;

    if (!user || !user.isAdmin) {
      return response.status(403).json({
        error: "Acesso negado: você precisa ser um administrador",
      });
    }

    next();
  }

  private async getAllCategories(request: Request, response: Response) {
    try {
      return await this.categoryController.getAllCategories(request, response);
    } catch (error) {
      console.error(error, "Erro ao buscar todas as categorias");
    }
  }

  // TODO - Adicionar estatísticas do sistema
  private async getDashboard(request: Request, response: Response) {
    try {
      const user = request.user as any;

      return response.status(200).json({
        message: "Dashboard do administrador",
        admin: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        stats: {
          // TODO - Adicionar estatísticas do sistema
          message: "Dashboard carregado com sucesso",
        },
      });
    } catch (error) {
      console.error(error, "Erro ao carregar dashboard");
      return response.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  }

  public getRouter() {
    return this.router;
  }
}

const adminRoutes = new AdminRoutes();

export default adminRoutes.getRouter();

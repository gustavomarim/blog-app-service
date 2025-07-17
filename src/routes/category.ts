import { Request, Response, Router } from "express";
import passport from "passport";
import { CategoryController } from "../controllers/CategoryController";

export class CategoryRoutes {
  private router: Router;
  private categoryController: CategoryController;

  constructor() {
    this.router = Router();
    this.categoryController = new CategoryController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Rotas públicas (leitura)
    this.router.get("/", this.getAllCategories.bind(this));
    this.router.get("/slug/:slug", this.getCategoryBySlug.bind(this));
    
    // Rotas protegidas (escrita) - Apenas admins
    this.router.post(
      "/create",
      passport.authenticate("jwt", { session: false }),
      this.verifyAdmin.bind(this),
      this.createCategory.bind(this)
    );
    this.router.put(
      "/update/:id",
      passport.authenticate("jwt", { session: false }),
      this.verifyAdmin.bind(this),
      this.updateCategory.bind(this)
    );
    this.router.delete(
      "/delete/:id",
      passport.authenticate("jwt", { session: false }),
      this.verifyAdmin.bind(this),
      this.deleteCategory.bind(this)
    );
  }

  // Middleware para verificar se o usuário é admin
  private verifyAdmin(request: Request, response: Response, next: any) {
    const user = request.user as any;

    if (!user || !user.isAdmin) {
      return response.status(403).json({
        error: "Acesso negado: você precisa ser um administrador para gerenciar categorias",
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

  private async getCategoryBySlug(request: Request, response: Response) {
    try {
      return await this.categoryController.getCategoryBySlug(request, response);
    } catch (error) {
      console.error(error, "Erro ao buscar categoria por slug");
    }
  }

  private async createCategory(request: Request, response: Response) {
    try {
      return await this.categoryController.createCategory(request, response);
    } catch (error) {
      console.error(error, "Erro ao criar categoria");
    }
  }

  private async updateCategory(request: Request, response: Response) {
    try {
      return await this.categoryController.updateCategory(request, response);
    } catch (error) {
      console.error(error, "Erro ao atualizar categoria");
    }
  }

  private async deleteCategory(request: Request, response: Response) {
    try {
      return await this.categoryController.deleteCategory(request, response);
    } catch (error) {
      console.error(error, "Erro ao deletar categoria");
    }
  }

  public getRouter() {
    return this.router;
  }
}

const categoryRoutes = new CategoryRoutes();

export default categoryRoutes.getRouter();

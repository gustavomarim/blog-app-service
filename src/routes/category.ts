import { Request, Response, Router } from "express";
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
    this.router.get("/", this.getAllCategories.bind(this));
    this.router.get("/slug/:slug", this.getCategoryBySlug.bind(this));
    this.router.get("/id/:id", this.getCategoryById.bind(this));
    this.router.post("/create", this.createCategory.bind(this));
    this.router.put("/update/:id", this.updateCategory.bind(this));
    this.router.delete("/delete/:id", this.deleteCategory.bind(this));
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

  private async getCategoryById(request: Request, response: Response) {
    try {
      return await this.categoryController.getCategoryById(request, response);
    } catch (error) {
      console.error(error, "Erro ao buscar categoria por id");
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

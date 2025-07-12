import { Request, Response, Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import AuthorizationService from "../services/AuthorizationService";

export class AdminRoutes {
  private router: Router;
  private categoryController: CategoryController;
  // private postController: PostController;

  constructor() {
    this.router = Router();
    this.categoryController = new CategoryController();
    // this.postController = new PostController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/categories",
      AuthorizationService.isAdmin(),
      this.getAllCategories.bind(this)
    );
  }

  private async getAllCategories(request: Request, response: Response) {
    try {
      return await this.categoryController.getAllCategories(request, response);
    } catch (error) {
      console.error(error, "Erro ao buscar todas as categorias");
    }
  }

  public getRouter() {
    return this.router;
  }
}

const adminRoutes = new AdminRoutes();

export default adminRoutes.getRouter();

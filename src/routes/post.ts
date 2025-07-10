import { Request, Response, Router } from "express";
import { NewPostController } from "../controllers/NewPostController";

export class PostRoutes {
  private router: Router;
  private postController: NewPostController;

  constructor() {
    this.router = Router();
    this.postController = new NewPostController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.getAllPosts.bind(this));
  }

  private async getAllPosts(request: Request, response: Response) {
    try {
      return await this.postController.getAllPosts(request, response);
    } catch (error) {
      console.error(error, "Erro ao buscar todas as postagens");
    }
  }

  public getRouter() {
    return this.router;
  }
}

const postRoutes = new PostRoutes();

export default postRoutes.getRouter();

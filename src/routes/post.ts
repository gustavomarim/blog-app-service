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
    this.router.get("/id/:id", this.getPostById.bind(this));
    this.router.post("/create", this.createPost.bind(this));
  }

  private async getAllPosts(request: Request, response: Response) {
    try {
      return await this.postController.getAllPosts(request, response);
    } catch (error) {
      console.error(error, "Erro ao buscar todas as postagens");
    }
  }

  private async getPostById(request: Request, response: Response) {
    try {
      return await this.postController.getPostById(request, response);
    } catch (error) {
      console.error(error, "Erro ao buscar postagem por id");
    }
  }

  private async createPost(request: Request, response: Response) {
    try {
      return await this.postController.createPost(request, response);
    } catch (error) {
      console.error(error, "Erro ao criar postagem");
    }
  }

  public getRouter() {
    return this.router;
  }
}

const postRoutes = new PostRoutes();

export default postRoutes.getRouter();

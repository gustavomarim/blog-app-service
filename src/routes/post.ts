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
    this.router.get("/slug/:slug", this.getPostBySlug.bind(this));
    this.router.post("/create", this.createPost.bind(this));
    this.router.put("/update/:id", this.updatePost.bind(this));
    this.router.delete("/delete/:id", this.deletePost.bind(this));
  }

  private async getAllPosts(request: Request, response: Response) {
    try {
      return await this.postController.getAllPosts(request, response);
    } catch (error) {
      console.error(error, "Erro ao buscar todas as postagens");
    }
  }

  private async getPostBySlug(request: Request, response: Response) {
    try {
      return await this.postController.getPostBySlug(request, response);
    } catch (error) {
      console.error(error, "Erro ao buscar postagem por slug");
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

  private async updatePost(request: Request, response: Response) {
    try {
      return await this.postController.updatePost(request, response);
    } catch (error) {
      console.error(error, "Erro ao atualizar postagem");
    }
  }

  private async deletePost(request: Request, response: Response) {
    try {
      return await this.postController.deletePost(request, response);
    } catch (error) {
      console.error(error, "Erro ao deletar postagem");
    }
  }

  public getRouter() {
    return this.router;
  }
}

const postRoutes = new PostRoutes();

export default postRoutes.getRouter();

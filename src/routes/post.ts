import { Request, Response, Router } from "express";
import passport from "passport";
import { PostController } from "../controllers/PostController";

export class PostRoutes {
  private router: Router;
  private postController: PostController;

  constructor() {
    this.router = Router();
    this.postController = new PostController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Rotas públicas (leitura)
    this.router.get("/", this.getAllPosts.bind(this));
    this.router.get("/id/:id", this.getPostById.bind(this));
    this.router.get("/slug/:slug", this.getPostBySlug.bind(this));
    this.router.get("/category/:slug", this.getPostsByCategory.bind(this));

    // Rotas protegidas (escrita) - Apenas admins
    this.router.post(
      "/create",
      passport.authenticate("jwt", { session: false }),
      this.verifyAdmin.bind(this),
      this.createPost.bind(this)
    );
    this.router.put(
      "/update/:id",
      passport.authenticate("jwt", { session: false }),
      this.verifyAdmin.bind(this),
      this.updatePost.bind(this)
    );
    this.router.delete(
      "/delete/:id",
      passport.authenticate("jwt", { session: false }),
      this.verifyAdmin.bind(this),
      this.deletePost.bind(this)
    );
  }

  // Middleware para verificar se o usuário é admin
  private verifyAdmin(request: Request, response: Response, next: any) {
    const user = request.user as any;

    if (!user || !user.isAdmin) {
      return response.status(403).json({
        error:
          "Acesso negado: você precisa ser um administrador para gerenciar posts",
      });
    }

    next();
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

  private async getPostsByCategory(request: Request, response: Response) {
    try {
      return await this.postController.getPostsByCategory(request, response);
    } catch (error) {
      console.error(error, "Erro ao buscar posts por categoria");
    }
  }

  public getRouter() {
    return this.router;
  }
}

const postRoutes = new PostRoutes();

export default postRoutes.getRouter();

import { Request, Response } from "express";
import postsModel from "../models/Post";

type PostBody = {
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
};

export class NewPostController {
  private postModel: typeof postsModel;

  constructor(postModel: typeof postsModel = postsModel) {
    this.postModel = postModel;
  }

  private handleError(error: any, response: Response, message: string) {
    console.error(`❌ ${message}:`, error);
    return response.status(500).json({
      error: `Erro interno do servidor: ${message}`,
    });
  }

  public async getAllPosts(request: Request, response: Response) {
    try {
      console.log("🔄 Buscando todos os posts...");

      const postList = await this.postModel
        .find()
        .populate("category")
        .sort({ date: "desc" });

      console.log(`📊 Encontrados ${postList.length} posts`);

      return response.json(postList);
    } catch (error) {
      return this.handleError(
        error,
        response,
        "Erro ao buscar todas as postagens"
      );
    }
  }

  public async getPostById(request: Request, response: Response) {
    try {
      const post = await this.postModel
        .findById(request.params.id)
        .populate("category");

      return response.json(post);
    } catch (error) {
      return this.handleError(
        error,
        response,
        "Erro ao buscar postagem por id"
      );
    }
  }

  public async createPost(request: Request, response: Response) {
    try {
      const { title, slug, description, content, category } = request.body;

      const postCreated = await this.postModel.create({
        title,
        slug,
        description,
        content,
        category,
      });

      return response.json({
        message: "Postagem criada com sucesso",
        post: postCreated,
      });
    } catch (error) {
      return this.handleError(error, response, "Erro ao criar postagem");
    }
  }
}

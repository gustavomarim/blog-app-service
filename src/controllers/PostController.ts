import { Request, Response } from "express";
import categoriesModel from "../models/Category";
import postsModel from "../models/Post";

type PostBody = {
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
};

export class PostController {
  private postModel: typeof postsModel;
  private categoryModel: typeof categoriesModel;

  constructor(
    postModel: typeof postsModel = postsModel,
    categoryModel: typeof categoriesModel = categoriesModel
  ) {
    this.postModel = postModel;
    this.categoryModel = categoryModel;
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

  public async getPostBySlug(request: Request, response: Response) {
    try {
      const post = await this.postModel.findOne({ slug: request.params.slug });
      return response.json(post);
    } catch (error) {
      return this.handleError(
        error,
        response,
        "Erro ao buscar postagem por slug"
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

  public async updatePost(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const { title, slug, description, content, category } =
        request.body as PostBody;

      const postUpdated = await this.postModel.findOneAndUpdate(
        { _id: id },
        {
          title,
          slug,
          description,
          content,
          category,
        }
      );

      return response.json({
        message: "Postagem atualizada com sucesso",
        post: postUpdated,
      });
    } catch (error) {
      return this.handleError(error, response, "Erro ao atualizar postagem");
    }
  }

  public async deletePost(request: Request, response: Response) {
    try {
      const { id } = request.params;

      const postDeleted = await this.postModel.findOneAndDelete({ _id: id });

      return response.json({
        message: "Postagem deletada com sucesso",
        post: postDeleted,
      });
    } catch (error) {
      return this.handleError(error, response, "Erro ao deletar postagem");
    }
  }

  public async getPostsByCategory(request: Request, response: Response) {
    try {
      const { slug } = request.params;

      const postByCategory = await this.categoryModel
        .findOne({ slug })
        .then((category) => {
          if (category) {
            return this.postModel.find({ category: category._id });
          }
        });

      return response.json(postByCategory);
    } catch (error) {
      return this.handleError(
        error,
        response,
        "Erro ao buscar posts por categoria"
      );
    }
  }
}

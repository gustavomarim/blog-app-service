import { Request, Response } from "express";
import categoriesModel from "../models/Category";

export class CategoryController {
  private categoryModel: typeof categoriesModel;

  constructor(categoryModel: typeof categoriesModel = categoriesModel) {
    this.categoryModel = categoryModel;
  }

  private handleError(error: any, response: Response, message: string) {
    console.error(`❌ ${message}:`, error);
    return response.status(500).json({
      error: `Erro interno do servidor: ${message}`,
    });
  }

  public async getAllCategories(request: Request, response: Response) {
    try {
      console.log("🔄 Buscando todas as categorias...");

      const categoryList = await this.categoryModel
        .find()
        .sort({ date: "desc" });

      return response.json(categoryList);
    } catch (error) {
      return this.handleError(
        error,
        response,
        "Erro ao buscar todas as categorias"
      );
    }
  }

  public async getCategoryBySlug(request: Request, response: Response) {
    try {
      const { slug } = request.params;
      const category = await this.categoryModel.findOne({ slug });

      return response.json(category);
    } catch (error) {
      return this.handleError(
        error,
        response,
        "Erro ao buscar categoria por slug"
      );
    }
  }

  public async getCategoryById(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const category = await this.categoryModel.findById(id);

      return response.json(category);
    } catch (error) {
      return this.handleError(
        error,
        response,
        "Erro ao buscar categoria por id"
      );
    }
  }

  public async createCategory(request: Request, response: Response) {
    try {
      const { name, slug } = request.body;

      const category = await this.categoryModel.create({ name, slug });

      return response.json(category);
    } catch (error) {
      return this.handleError(error, response, "Erro ao criar categoria");
    }
  }

  public async updateCategory(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const { name, slug } = request.body;

      const category = await this.categoryModel.findByIdAndUpdate(id, {
        name,
        slug,
      });

      return response.json({
        message: "Categoria atualizada com sucesso!",
        category,
      });
    } catch (error) {
      return this.handleError(error, response, "Erro ao atualizar categoria");
    }
  }

  public async deleteCategory(request: Request, response: Response) {
    try {
      const { id } = request.params;

      const category = await this.categoryModel.findByIdAndDelete(id);

      return response.json({
        message: "Categoria deletada com sucesso!",
        category,
      });
    } catch (error) {
      return this.handleError(error, response, "Erro ao deletar categoria");
    }
  }
}

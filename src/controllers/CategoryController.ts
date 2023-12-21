import { Request, Response } from 'express';
import categoriesModel from '../models/Category';
import postsModel from '../models/Post';

const Category = categoriesModel;
const Post = postsModel;

export default {
  // GET
  async read(request: Request, response: Response) {
    const categoryList = await Category.find().sort({ date: 'desc' });

    return response.json(categoryList);
  },

  // GET
  async readPostsByCategory(request: Request, response: Response) {
    const categoryList = await Category.findOne({
      slug: request.params.slug,
    })
      .then((category) => {
        if (category) {
          return Post.find({ category: category._id });
        }
      })
      .catch((err: Error) => response.json(err));

    if (categoryList) return response.json(categoryList);

    return response.status(400).json({
      error: 'Houve um erro interno ao carregar a lista de categorias',
    });
  },

  // GET
  async readCategoryBySlug(request: Request, response: Response) {
    const category = await Category.findOne({ slug: request.params.slug });

    if (category) return response.json(category);

    return response.status(400).json({
      error: 'Houve um erro interno ao carregar a categoria',
    });
  },

  // POST
  async create(request: Request, response: Response) {
    const { name, slug } = request.body;

    // REFORMULAR PARA UMA VALIDAÇÃO DE FORMULÁRIO REUTILIZÁVEL
    if (!name || !slug)
      return response
        .status(400)
        .json({ error: 'É necessário preencher um Nome e um Slug' });

    const categoryCreated = await Category.create({
      name,
      slug,
    });

    if (categoryCreated) return response.json(categoryCreated);

    return response
      .status(401)
      .json({ error: ' Houve um erro ao salvar a categoria!' });
  },

  // PUT
  async update(request: Request, response: Response) {
    const { id } = request.params;
    const { name, slug } = request.body;

    // ADICIONAR VALIDAÇÃO DE FORMULÁRIO

    const categoryUpdated = await Category.findOneAndUpdate(
      { _id: id },
      {
        name,
        slug,
      },
    );

    if (categoryUpdated) return response.json(categoryUpdated);

    return response
      .status(401)
      .json({ error: 'Não foi encontrada a categoria para atualizar!' });
  },

  // DELETE
  async delete(request: Request, response: Response) {
    const { id } = request.params;

    const categoryDeleted = await Category.findOneAndDelete({ _id: id });

    if (categoryDeleted) return response.json(categoryDeleted);

    return response
      .status(401)
      .json({ error: 'Não foi encontrada a categoria para deletar!' });
  },
};

import { Request, Response } from 'express';
import postsModel from '../models/Post';

const Post = postsModel;

export default {
  // GET
  async read(request: Request, response: Response) {
    const postList = await Post.find()
      // Faz a conexão da collection de Postagem com a de Categoria
      .populate('category')
      .sort({ date: 'desc' });

    if (postList) return response.json(postList);

    return response
      .status(400)
      .json({ error: 'Houve um erro ao listar as postagens' });
  },

  async readOne(request: Request, response: Response) {
    const post = await Post.findOne({slug: request.params.slug})

    if(post) return response.json(post);

    return response.status(400).json({error: 'Houve um erro ao listar a postagem'});
  },

  // POST
  async create(request: Request, response: Response) {
    const { title, slug, description, content, category } = request.body;

    // ADICIONAR VALIDAÇÃO...

    const postCreated = await Post.create({
      title,
      slug,
      description,
      content,
      category,
    });

    if (postCreated) return response.json(postCreated);

    return response
      .status(401)
      .json({ error: 'Houve um erro ao salvar a postagem' });
  },

  // PUT
  async update(request: Request, response: Response) {
    const { id } = request.params;
    const { title, slug, description, content, category } = request.body;

    const postUpdated = await Post.findOneAndUpdate(
      { _id: id },
      {
        title,
        slug,
        description,
        content,
        category,
      },
    );

    if (postUpdated) return response.json(postUpdated);

    return response
      .status(401)
      .json({ error: 'Não foi encontrado o post para atualizar' });
  },

  // DELETE
  async delete(request: Request, response: Response) {
    const { id } = request.params;

    const postDeleted = await Post.findOneAndDelete({ _id: id });

    if (postDeleted) return response.json(postDeleted);

    return response
      .status(401)
      .json({ error: 'Não foi encontrado o post para deletar!' });
  },
};

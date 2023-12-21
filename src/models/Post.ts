import { model, Schema } from 'mongoose';

export interface PostProps {
  title: string;
  slug: string;
  description: string;
  content: string;
  category: Schema.Types.ObjectId;
  date: Date;
}

const Post = new Schema<PostProps>({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  // relaciona com a collection Categoria
  category: {
    type: Schema.Types.ObjectId,
    ref: 'categories',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

const postsModel = model<PostProps>('posts', Post);

export default postsModel;

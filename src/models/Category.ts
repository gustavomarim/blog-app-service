import { model, Schema } from 'mongoose';

export interface CategoryProps {
  name: string;
  slug: string;
  date: Date;
}

const Category = new Schema<CategoryProps>({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

const categoriesModel = model<CategoryProps>('categories', Category);

export default categoriesModel;

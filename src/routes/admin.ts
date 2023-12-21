import { Router } from 'express';
import CategoryController from '../controllers/CategoryController';
import PostController from '../controllers/PostController';
import { isAdmin } from './../helpers/isAdmin';
const router = Router();

const categoryController = CategoryController;
const postController = PostController;

// Rota Category
router.get('/admin/categories', isAdmin, categoryController.read);
router.post('/admin/categories', isAdmin, categoryController.create);
router.put('/admin/categories/:id', isAdmin, categoryController.update);
router.delete('/admin/categories/:id', isAdmin, categoryController.delete);

// Rota Post
router.get('/admin/posts', isAdmin, postController.read);
router.post('/admin/posts', isAdmin, postController.create);
router.put('/admin/posts/:id', isAdmin, postController.update);
router.delete('/admin/posts/:id', isAdmin, postController.delete);

module.exports = router;

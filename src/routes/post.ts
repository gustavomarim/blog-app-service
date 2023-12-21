import { Router } from 'express';
import PostController from '../controllers/PostController';
const router = Router();

const postController = PostController;

// One Post
router.get('/posts/:slug', postController.readOne);

module.exports = router;

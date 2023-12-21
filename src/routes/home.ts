import { Router } from 'express';
import PostController from '../controllers/PostController';
const router = Router();

const postController = PostController;

// All Posts
router.get('/', postController.read);

module.exports = router;

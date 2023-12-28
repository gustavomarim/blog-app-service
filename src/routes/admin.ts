import { Router } from "express";
import CategoryController from "../controllers/CategoryController";
import PostController from "../controllers/PostController";
const router = Router();

const categoryController = CategoryController;
const postController = PostController;

// Rota Category
router.get("/admin/categories", categoryController.read);
router.post("/admin/categories", categoryController.create);
router.put("/admin/categories/:id", categoryController.update);
router.delete("/admin/categories/:id", categoryController.delete);

// Rota Post
router.get("/admin/posts", postController.read);
router.post("/admin/posts", postController.create);
router.put("/admin/posts/:id", postController.update);
router.delete("/admin/posts/:id", postController.delete);

module.exports = router;

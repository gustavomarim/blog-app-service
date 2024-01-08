import { Router } from "express";
import UserController from "../controllers/UserController";
const router = Router();

const userController = UserController;

router.post("/users/register", userController.register);

router.post("/users/login", userController.login);
router.get("/users/logout", userController.logout);

export default router;

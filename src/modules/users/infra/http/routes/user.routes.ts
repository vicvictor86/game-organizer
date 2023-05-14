import { Router } from "express";
import ensureAuthenticate from "../../middlewares/ensureAuthenticate";
import UsersController from "../controllers/UserController";

const userRouter = Router();
const usersController = new UsersController();

userRouter.post("/", usersController.create);
userRouter.get("/:userId", ensureAuthenticate, usersController.index);

export default userRouter;
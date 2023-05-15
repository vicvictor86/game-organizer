import { Router } from "express";
import ensureAuthenticate from "../../middlewares/ensureAuthenticate";
import UsersController from "../controllers/UserController";
import UserSettingsController from "../controllers/UserSettingsController";

const userRouter = Router();
const usersController = new UsersController();
const userSettingsController = new UserSettingsController();

userRouter.post("/", usersController.create);
userRouter.get("/", ensureAuthenticate, usersController.index);

userRouter.get("/settings", ensureAuthenticate, userSettingsController.index);
userRouter.put("/settings", ensureAuthenticate, userSettingsController.update);

export default userRouter;
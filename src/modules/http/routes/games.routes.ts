import { Router } from "express";
import GamesController from "../controllers/GamesController";

const gamesRouter = Router();
const gamesController = new GamesController();

gamesRouter.post('/', gamesController.create);

export default gamesRouter;
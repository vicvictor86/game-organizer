import { Router } from 'express';
import ensureAuthenticate from '../../../../users/infra/middlewares/ensureAuthenticate';
import GamesController from '../controllers/GamesController';

const gamesRouter = Router();
const gamesController = new GamesController();

gamesRouter.get('/', gamesController.index);
gamesRouter.post('/', ensureAuthenticate, gamesController.create);

export default gamesRouter;

import { Router } from 'express';

import gamesRouter from '../../../../modules/http/routes/games.routes';

const routes = Router();

routes.use('/games', gamesRouter);

export default routes;
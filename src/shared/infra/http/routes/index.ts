import { Router } from 'express';

import gamesRouter from '../../../../modules/games/http/routes/games.routes';
import integrationRouter from '../../../../modules/integration/http/routes/integration.routes';

const routes = Router();

routes.use('/games', gamesRouter);
routes.use('/integration', integrationRouter);

export default routes;
import { Router } from 'express';

import gamesRouter from '../../../../modules/games/infra/http/routes/games.routes';
import integrationRouter from '../../../../modules/integration/infra/http/routes/integration.routes';
import userRouter from '../../../../modules/users/infra/http/routes/user.routes';
import sessionsRouter from '../../../../modules/users/infra/http/routes/sessions.routes';
import notionApiRouter from '../../../../modules/integration/infra/http/routes/notionApi.routes';

const routes = Router();

routes.use('/games', gamesRouter);
routes.use('/integration', integrationRouter);
routes.use('/users', userRouter);
routes.use('/login', sessionsRouter);
routes.use('/info', notionApiRouter);

export default routes;

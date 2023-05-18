import { Router } from 'express';
import ensureAuthenticate from '../../../../users/infra/middlewares/ensureAuthenticate';
import IntegrationController from '../controllers/IntegrationController';

const integrationRouter = Router();
const integrationController = new IntegrationController();

integrationRouter.get('/', ensureAuthenticate, integrationController.create);
integrationRouter.get('/info', ensureAuthenticate, integrationController.index);

export default integrationRouter;

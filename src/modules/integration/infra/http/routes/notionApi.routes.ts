import { Router } from 'express';
import ensureAuthenticate from '../../../../users/infra/middlewares/ensureAuthenticate';
import NotionApiController from '../controllers/NotionApiController';

const notionApiRouter = Router();
const notionApiController = new NotionApiController();

notionApiRouter.get('/', ensureAuthenticate, notionApiController.index);

export default notionApiRouter;

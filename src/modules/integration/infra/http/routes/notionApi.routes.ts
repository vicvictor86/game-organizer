import { Router } from 'express';
import ensureAuthenticate from '../../../../users/infra/middlewares/ensureAuthenticate';
import NotionApiController from '../controllers/NotionApiController';
import NotionApiPagesController from '../controllers/NotionApiPagesController';

const notionApiRouter = Router();
const notionApiController = new NotionApiController();
const notionApiPagesController = new NotionApiPagesController();

notionApiRouter.get('/', ensureAuthenticate, notionApiController.index);
notionApiRouter.get('/page/:pageId', ensureAuthenticate, notionApiPagesController.index);

export default notionApiRouter;

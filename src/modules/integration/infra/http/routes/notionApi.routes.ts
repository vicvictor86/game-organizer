import { Router } from 'express';
import ensureAuthenticate from '../../../../users/infra/middlewares/ensureAuthenticate';

import NotionApiController from '../controllers/NotionApiController';
import NotionPagesController from '../controllers/NotionPagesController';
import NotionTablePagesAndDatabasesController from '../controllers/NotionTablePagesAndDatabasesController';

const notionApiRouter = Router();

const notionApiController = new NotionApiController();
const notionTablePagesAndDatabasesController = new NotionTablePagesAndDatabasesController();
const notionPagesController = new NotionPagesController();

notionApiRouter.get('/', ensureAuthenticate, notionApiController.index);

notionApiRouter.get('/pages/', ensureAuthenticate, notionPagesController.show);
notionApiRouter.post('/create/', ensureAuthenticate, notionTablePagesAndDatabasesController.create);

export default notionApiRouter;

import { Router } from "express";
import IntegrationController from "../controllers/IntegrationController";

const integrationRouter = Router();
const integrationController = new IntegrationController();

integrationRouter.get('/', integrationController.index);
// integrationRouter.post('/', integrationController.create);

export default integrationRouter;
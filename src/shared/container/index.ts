import { container } from "tsyringe";

import { IAPIConsumer } from "../../interfaces/IAPIConsumer";
import { APIConsumer } from "../../apis/APIConsumer";

import { INotionUserConnectionRepository } from "../../modules/users/infra/repositories/INotionUserConnectionRepository";
import { NotionUserConnectionRepository } from "../../modules/users/infra/typeorm/repositories/NotionUserConnectionRepository";

container.registerSingleton<IAPIConsumer>('APIConsumer', APIConsumer);

container.registerInstance<INotionUserConnectionRepository>('NotionUserConnectionRepository', NotionUserConnectionRepository);
import { container } from "tsyringe";

import { INotionUserConnectionRepository } from "../../modules/users/infra/repositories/INotionUserConnectionRepository";
import { NotionUserConnectionRepository } from "../../modules/users/infra/typeorm/repositories/NotionUserConnectionRepository";

container.registerInstance<INotionUserConnectionRepository>('NotionUserConnectionRepository', NotionUserConnectionRepository);
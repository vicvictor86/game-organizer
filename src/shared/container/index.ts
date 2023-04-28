import { container } from "tsyringe";

import { INotionUserConnectionRepository } from "../../modules/integration/repositories/INotionUserConnectionRepository";
import { NotionUserConnectionRepository } from "../../modules/integration/infra/typeorm/repositories/NotionUserConnectionRepository";

import { IUsersRepository } from "../../modules/users/repositories/IUsersRepository";
import { UsersRepository } from "../../modules/users/infra/typeorm/repositories/UserRepository";

container.registerInstance<INotionUserConnectionRepository>('NotionUserConnectionRepository', NotionUserConnectionRepository);

container.registerInstance<IUsersRepository>('UsersRepository', UsersRepository);
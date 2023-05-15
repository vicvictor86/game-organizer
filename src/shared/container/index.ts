import { container } from "tsyringe";

import { INotionUserConnectionRepository } from "../../modules/integration/repositories/INotionUserConnectionRepository";
import { NotionUserConnectionRepository } from "../../modules/integration/infra/typeorm/repositories/NotionUserConnectionRepository";

import { IUsersRepository } from "../../modules/users/repositories/IUsersRepository";
import { UsersRepository } from "../../modules/users/infra/typeorm/repositories/UserRepository";

import { IUserSettingsRepository } from "../../modules/users/repositories/IUserSettingsRepository";
import { UserSettingsRepository } from "../../modules/users/infra/typeorm/repositories/UserSettingsRepository";

container.registerInstance<INotionUserConnectionRepository>('NotionUserConnectionRepository', NotionUserConnectionRepository);

container.registerInstance<IUsersRepository>('UsersRepository', UsersRepository);

container.registerInstance<IUserSettingsRepository>('UserSettingsRepository', UserSettingsRepository);
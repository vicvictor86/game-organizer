import { ICreateUserSettingsDTO } from '../dtos/ICreateUserSettings';
import { UserSettings } from '../infra/typeorm/entities/UserSettings';

export interface IUserSettingsRepository {
  findById(id: string): Promise<UserSettings | null>;
  findByUserId(userId: string): Promise<UserSettings | null>;
  create(data: ICreateUserSettingsDTO): Promise<UserSettings>;
  save(userSettings: UserSettings): Promise<UserSettings>;
}

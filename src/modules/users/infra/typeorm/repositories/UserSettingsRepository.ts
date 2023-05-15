import { connectionSource } from '../../../../../shared/infra/typeorm';

import { ICreateUserSettingsDTO } from '../../../dtos/ICreateUserSettings';

import { IUserSettingsRepository } from '../../../repositories/IUserSettingsRepository';

import { UserSettings } from '../entities/UserSettings';

const userSettingsRepository = connectionSource.getRepository(UserSettings);

export const UserSettingsRepository: IUserSettingsRepository = userSettingsRepository.extend({
  async findById(id: string): Promise<UserSettings | null> {
    const userSettings = await userSettingsRepository.findOne({
      where: {
        id,
      },
    });

    return userSettings;
  },

  async findByUserId(userId: string): Promise<UserSettings | null> {
    const userSettings = await userSettingsRepository.findOne({
      where: {
        userId,
      },
    });

    return userSettings;
  },

  async create(userSettingsData: ICreateUserSettingsDTO): Promise<UserSettings> {
    const userSettings = userSettingsRepository.create(userSettingsData);

    await userSettingsRepository.save(userSettings);

    return userSettings;
  },

  async save(userSettings: UserSettings): Promise<UserSettings> {
    return userSettingsRepository.save(userSettings);
  },

});

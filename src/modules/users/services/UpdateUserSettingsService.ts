import { inject, injectable } from "tsyringe";

import { AppError } from "../../../shared/errors/AppError";

import { UserSettings } from "../infra/typeorm/entities/UserSettings";

import { IUserSettingsRepository } from "../repositories/IUserSettingsRepository";

interface Request {
  userId: string;

  statusName: string;
}

@injectable()
export default class UpdateUserSettingsService {
  constructor(
    @inject("UserSettingsRepository")
    private userSettingsRepository: IUserSettingsRepository,
  ) { }

  public async execute({ statusName, userId }: Request): Promise<UserSettings> {
    const userSettings = await this.userSettingsRepository.findByUserId(userId);

    if (!userSettings) {
      throw new AppError("User settings not found", 404);
    }

    const userSettingsUpdated = await this.userSettingsRepository.save({
      ...userSettings,
      statusName,
    });

    return userSettingsUpdated;
  }
}
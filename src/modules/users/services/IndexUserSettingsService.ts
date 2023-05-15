import { inject, injectable } from "tsyringe";

import { AppError } from "../../../shared/errors/AppError";

import { UserSettings } from "../infra/typeorm/entities/UserSettings";

import { IUserSettingsRepository } from "../repositories/IUserSettingsRepository";

interface Request {
  userId: string;
}

@injectable()
export default class IndexUserSettingsService {
  constructor(
    @inject("UserSettingsRepository")
    private userSettingsRepository: IUserSettingsRepository,
  ) { }

  public async execute({ userId }: Request): Promise<UserSettings> {
    const userSettings = await this.userSettingsRepository.findByUserId(userId);

    if (!userSettings) {
      throw new AppError("User settings not found", 404);
    }

    return userSettings;
  }
}
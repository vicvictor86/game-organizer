import { container } from "tsyringe";
import { Request, Response } from "express";
import { instanceToInstance } from "class-transformer";

import UpdateUserSettingsService from "../../../services/UpdateUserSettingsService";
import IndexUserSettingsService from "../../../services/IndexUserSettingsService";

export default class UserSettingsController {
  public async update(request: Request, response: Response) {
    const { statusName } = request.body;
    const { id } = request.user;

    const updateUserSettingsService = container.resolve(UpdateUserSettingsService);

    const userSettings = await updateUserSettingsService.execute({ statusName, userId: id });

    return response.status(200).json(instanceToInstance(userSettings));
  }

  public async index(request: Request, response: Response) {
    const { id } = request.user;

    const indexUserSettingsService = container.resolve(IndexUserSettingsService);

    const userSettings = await indexUserSettingsService.execute({ userId: id });

    return response.status(200).json(instanceToInstance(userSettings));
  }
}
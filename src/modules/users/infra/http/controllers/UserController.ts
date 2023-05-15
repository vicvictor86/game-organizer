import { container } from 'tsyringe';
import { Request, Response } from 'express';
import { instanceToInstance } from 'class-transformer';

import { IndexUserService } from '../../../services/IndexUserService';
import CreateUserService from '../../../services/CreateUserService';

export default class UsersController {
  public async create(request: Request, response: Response) {
    const { username, password } = request.body;

    const createUserService = container.resolve(CreateUserService);

    const user = await createUserService.execute({ username, password });

    return response.status(200).json(instanceToInstance(user));
  }

  public async index(request: Request, response: Response) {
    const { id } = request.user;

    const indexUserService = container.resolve(IndexUserService);

    const user = await indexUserService.execute({ userId: id });

    const userWithoutPassword = instanceToInstance(user);

    return response.status(200).json({ user: userWithoutPassword });
  }
}

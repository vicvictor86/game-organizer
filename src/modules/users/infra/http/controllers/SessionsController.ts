import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { instanceToInstance } from 'class-transformer';
import AuthenticateService from '../../../services/AuthenticateService';

export default class SessionsController {
  public async create(request: Request, response: Response) {
    const { username, password } = request.body;

    const authenticateService = container.resolve(AuthenticateService);

    const { user, token } = await authenticateService.execute({ username, password });

    const userWithoutPassword = instanceToInstance(user);

    return response.status(200).json({ user: userWithoutPassword, token });
  }
}
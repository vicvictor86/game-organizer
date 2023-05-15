/* eslint-disable import/no-extraneous-dependencies */

import { hash } from 'bcryptjs';
import { User } from 'notion-api-types/requests';
import { inject, injectable } from 'tsyringe';

import { AppError } from '../../../shared/errors/AppError';
import { IUserSettingsRepository } from '../repositories/IUserSettingsRepository';
import { IUsersRepository } from '../repositories/IUsersRepository';

interface Request {
  username: string;

  password: string;
}

@injectable()
export default class CreateUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('UserSettingsRepository')
    private userSettingsRepository: IUserSettingsRepository,
  ) { }

  public async execute({ username, password }: Request): Promise<User> {
    const usernameExists = await this.usersRepository.findByUsername(username);

    if (usernameExists) {
      throw new AppError('Username already exists');
    }

    const hashedPassword = await hash(password, 8);

    const user = await this.usersRepository.create({
      username,
      password: hashedPassword,
    });

    await this.userSettingsRepository.create({
      userId: user.id,
    });

    return user;
  }
}

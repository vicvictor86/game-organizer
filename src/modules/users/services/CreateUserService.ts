import { hash } from "bcryptjs";
import { User } from "notion-api-types/requests";
import { inject, injectable } from "tsyringe";

import { AppError } from "../../../shared/errors/AppError";
import { IUsersRepository } from "../repositories/IUsersRepository";

interface Request {
  username: string;

  password: string;
}

@injectable()
export default class CreateUserService {

  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
  ) { }

  public async execute({ username, password }: Request): Promise<User> {
    const usernameExists = await this.usersRepository.findByUsername(username);

    if (usernameExists) {
      throw new AppError('Username already exists')
    }

    const hashedPassword = await hash(password, 8);

    const user = await this.usersRepository.create({
      username,
      password: hashedPassword,
    });

    return user;
  }
}
import { User } from "notion-api-types/requests";
import { inject, injectable } from "tsyringe";

import { AppError } from "../../../shared/errors/AppError";
import { IUsersRepository } from "../repositories/IUsersRepository";

interface Request {
  userId: string;
}

@injectable()
export class IndexUserService {

  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
  ) { }

  public async execute({ userId }: Request): Promise<User> {
    const user = await this.usersRepository.findById(userId);

    if(!user) {
      throw new AppError('User not found');
    }

    return user;
  }
}
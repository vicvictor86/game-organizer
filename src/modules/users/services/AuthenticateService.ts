import { AppError } from "../../../shared/errors/AppError";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { inject, injectable } from "tsyringe";
import ICreateLoginSessionsDTO from "../dtos/ICreateLoginSessionsDTO";
import { User } from "../infra/typeorm/entities/User";
import { IUsersRepository } from "../repositories/IUsersRepository";
import { authConfig } from '../../../config/auth';

interface Response {
  user: User;

  token: string;
}

@injectable()
export default class AuthenticateService {
  constructor(
    @inject('UsersRepository')
    private userRepository: IUsersRepository,
  ) { }

  public async execute({ username, password }: ICreateLoginSessionsDTO): Promise<Response> {
    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      throw new AppError('Username or password incorrect');
    }

    const hashedPassword = user.password;

    const authenticated = await compare(password, hashedPassword);

    if (!authenticated) {
      throw new AppError('Username or password incorrect');
    }

    const token = sign({}, authConfig.jwt.secret, {
      subject: user.id,
      expiresIn: authConfig.jwt.expiresIn,
    });

    return { user, token };
  }
}
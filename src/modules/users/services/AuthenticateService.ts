import { AppError } from "../../../shared/errors/AppError";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { inject, injectable } from "tsyringe";
import ICreateLoginSessionsDTO from "../dtos/ICreateLoginSessionsDTO";
import { User } from "../infra/typeorm/entities/User";
import { IUsersRepository } from "../repositories/IUsersRepository";
import { authConfig } from '../../../config/auth';
import { IUserSettingsRepository } from "../repositories/IUserSettingsRepository";
import { UserSettings } from "../infra/typeorm/entities/UserSettings";

interface Response {
  user: User;

  token: string;

  userSettings: UserSettings;
}

@injectable()
export default class AuthenticateService {
  constructor(
    @inject('UsersRepository')
    private userRepository: IUsersRepository,

    @inject("UserSettingsRepository")
    private userSettingsRepository: IUserSettingsRepository,
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

    const userSettings = await this.userSettingsRepository.findByUserId(user.id);

    if (!userSettings) {
      throw new AppError("User settings not found", 404);
    }

    return { user, token, userSettings };
  }
}
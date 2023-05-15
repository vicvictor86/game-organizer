import { User } from '../entities/User';
import { connectionSource } from '../../../../../shared/infra/typeorm';

import { IUsersRepository } from '../../../repositories/IUsersRepository';
import { ICreateUserDTO } from '../../../dtos/ICreateUserDTO';

const usersRepository = connectionSource.getRepository(User);

export const UsersRepository: IUsersRepository = usersRepository.extend({
  async findById(id: string): Promise<User | null> {
    const user = await usersRepository.findOne({
      where: {
        id,
      },
    });

    return user;
  },

  async findByUsername(username: string): Promise<User | null> {
    const user = await usersRepository.findOne({
      where: {
        username,
      },
    });

    return user;
  },

  async create(userData: ICreateUserDTO): Promise<User> {
    const users = usersRepository.create(userData);

    await usersRepository.save(users);

    return users;
  },

  async save(user: User): Promise<User> {
    return usersRepository.save(user);
  },

});

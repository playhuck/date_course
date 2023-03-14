import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { SignupUserDto, User } from 'src/models/_.loader';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
  async findUserByUserId(userId: string) {
    const findUserByUserId = await this.findOne({ where: { userId } });
    return findUserByUserId;
  }

  async findUserById(id : number) {
    const findUserById = await this.findOne({ where : { id }})
    return findUserById
  }

  async signup(body : SignupUserDto, hashedPassword : string) {
    const create = await this.create(body);
    create.password = hashedPassword
    return await this.save(create);
  }
}

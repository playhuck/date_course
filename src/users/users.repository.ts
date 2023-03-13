import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { User } from 'src/models/_.loader';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
  async isUserByUserId(userId: string) {
    const isUserByUserId = await this.findOne({ where: { userId } });
    return isUserByUserId;
  }
}

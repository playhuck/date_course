import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AppService } from 'src/app.service';
import { LoginUserDto, SignupUserDto } from 'src/models/_.loader';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}



  async signup(body: SignupUserDto) {
    const { userId, name, password, passwordCheck } = body;

    /** 비밀번호가 일치하는지 확인 */
    if (password !== passwordCheck)
      throw new BadRequestException("PASSWORD DON'T MATCH");

    /** 아이디가 존재하는지 확인 */
    const isUserByUserId = await this.usersRepository.isUserByUserId(userId);
    if (isUserByUserId !== null)
      throw new BadRequestException('ID ALREADY IN USE');

    const hash = await bcrypt.hash(password, 10);
    console.log(hash);
    if (!hash) {
    }

    // const signup = await.thi
  }

  async login(body: LoginUserDto) {}
}

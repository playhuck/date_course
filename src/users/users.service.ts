import { Injectable, BadRequestException } from '@nestjs/common';
import {
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { LoginUserDto, SignupUserDto, User } from 'src/models/_.loader';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: Repository<User>,
    private readonly dataSource : DataSource,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(body: SignupUserDto): Promise<User> {
    const { userId, name, password, passwordCheck } = body;

    /** 비밀번호가 일치하는지 확인 */
    if (password !== passwordCheck)
      throw new BadRequestException("PASSWORD DON'T MATCH");

    /** 아이디가 존재하는지 확인 */
    const findUserByUserId = await this.usersRepository.findOne({ where : { userId }});
    console.log(findUserByUserId)
    if (findUserByUserId !== null)
      throw new BadRequestException('ID ALREADY IN USE');
    
    /** 비밀번호 Hash */
    let saltRound = this.configService.get<number>('SALT_ROUND')
    const salt = await bcrypt.genSalt(saltRound);
    
    const hash = await bcrypt.hash(password, salt);
    if (!hash) throw new NotImplementedException('NOT IMPLEMENT BCRYPT HASH');

    const queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    /** 유저 생성 */
    const create = this.usersRepository.create(body);

    create.password = hash

    const signup = this.usersRepository.save(create);

    await queryRunner.commitTransaction();

    if (!signup) throw new NotImplementedException('NOT IMPLEMENT SAVE USER');

    return signup;
  }

  async login(body: LoginUserDto): Promise<{token : string}> {
    const { userId, password } = body;

    /** userId가 존재하는지 확인 */
    const findUserByUserId = await this.usersRepository.findOne({ where : { userId }});
    if (!findUserByUserId)
      throw new UnauthorizedException('회원가입이 필요합니다.');

    /** 아이디가 존재한다면, 비밀번호가 일치 하는지. */
    const comparePassword = await bcrypt.compare(
      password,
      findUserByUserId.password,
    );
    if (!comparePassword)
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');

    /** 비밀번호가 일치 한다면, JWT발급. */
    const payload = { id: findUserByUserId.id };
    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRED_IN'),
      algorithm: 'RS256',
    }); 

    return { token };
  }
}

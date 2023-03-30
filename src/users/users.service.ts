import { Injectable, BadRequestException } from '@nestjs/common';
import {
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, SignupUserDto, User } from '../models/_.loader';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(body: SignupUserDto, queryRunnerManager : EntityManager ): Promise<User> {
      const { userId, name, password, passwordCheck } = body;

      /** 비밀번호가 일치하는지 확인 */
      if (password !== passwordCheck)
        throw new BadRequestException("PASSWORD DON'T MATCH");

      /** 아이디가 존재하는지 확인 */
      // const findUserIdByUserId = await queryRunnerManager.query(`SELECT userId FROM user WHERE userId=?`, [userId]);
      const findUserIdByUserId = await queryRunnerManager.findOne(User, {
        where: { userId },
      });

      if (findUserIdByUserId !== null)
        throw new BadRequestException('ID ALREADY IN USE'); 

      /** 비밀번호 Hash */
      let saltRound = this.configService.get<number>('SALT_ROUND');
      const salt = await bcrypt.genSalt(saltRound);

      const hash = await bcrypt.hash(password, salt);
      if (!hash) throw new NotImplementedException('NOT IMPLEMENT BCRYPT HASH');

      /** 유저 생성 */
      // const insertUser = await queryRunnerManger.query(`
      // INSERT INTO user ( userId, name, password) VALUES (?,?,?)`, [userId, name, hash]);
      const create = queryRunnerManager.create(User ,body);

      create.password = hash;

      const signup = await queryRunnerManager.save(create);

      if (!signup) throw new NotImplementedException('NOT IMPLEMENT SAVE USER');

      return signup;
  }

  async login(body: LoginUserDto): Promise<{ token: string }> {
    const { userId, password } = body;

    /** userId가 존재하는지 확인 */
    const findUserByUserId = await this.usersRepository.findOne({
      where: { userId : userId },
    });
    if (!findUserByUserId)
      throw new UnauthorizedException('회원가입이 필요합니다.');

    /** 아이디가 존재한다면, 비밀번호가 일치 하는지. */
    const comparePassword = await bcrypt.compare(
      password,
      findUserByUserId.password
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
  };

  async getPayload(user : User) {
    if(user) return user;
    else throw new UnauthorizedException('Not Token')
  }

  async getUserById(id : number) {
    return await this.usersRepository.findOne({ where : {
      id
    }});
  };

  async delUser(userId : string) {
    return await this.usersRepository.delete({ userId });
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';
import { SignupUserDto, User } from '../../src/models/_.loader';
import { DataSource, Repository } from 'typeorm';
import { UsersService } from '../../src/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('User Module Integration', () => {
  let app: INestApplication;
  let token: string;
  let usersService: UsersService;
  let usersRepository : Repository<User>

  let user : SignupUserDto = {
    userId: 'wngur89',
    name: 'lay',
    password: 'aaaa1234!',
    passwordCheck : 'aaaa1234!'
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [AppController],
      providers: [AppService]
    }).compile();

    usersService = moduleFixture.get<UsersService>(UsersService);
    usersRepository = moduleFixture.get(getRepositoryToken(User));
    app = moduleFixture.createNestApplication();
    
    await app.init();
  });

  afterEach(async() => {
    const conn = app.get(DataSource);
    await conn.synchronize(true);
    return await usersService.delUser('wngur89');
  })

  /** 회원가입 Flow */
  describe('/users/signup (POST)', () => {
    /** 제일먼저, 비밀번호가 일치하는지 통과*/
    it('should return 400 password miss match', async () => {
      const body = {
        userId: 'wngur89',
        name: 'lay',
        password: 'aaaa1234!',
        passwordCheck: 'aaaa1234@',
      };
      return await request(app.getHttpServer())
        .post('/users/signup')
        .send(body)
        .expect(400);
    });
    /** 회원가입이 성공했는지 통과*/
    it('should return 201', async () => {
      const body: SignupUserDto = {
        userId: 'wngur89',
        name: 'lay',
        password: 'aaaa1234!',
        passwordCheck: 'aaaa1234!',
      };

      return await request(app.getHttpServer())
        .post('/users/signup')
        .send(body)
        .expect(201);

    });
    /** 중복된 아이디로 회원 가입시 에러가 발생하는지 */
    it('should return 400 given exist userId', async () => {
      const body: SignupUserDto = {
        userId: 'wngur89',
        name: 'lay',
        password: 'aaaa1234!',
        passwordCheck: 'aaaa1234!',
      };
      await usersRepository.save(user);

      await request(app.getHttpServer())
        .post('/users/signup')
        .send(body)
        .expect(400);
      
      return await usersService.delUser('wngur89');
    });
  });

  describe('/users/login (POST)', () => {
    /** Input으로 들어온 userId가 존재하지 않는 지 */
    it('should return 401 givne not exist userId', async () => {
      const body = {
        userId: 'wngur90',
        password: 'aaaa1234!',
      };
  
      return await request(app.getHttpServer())
        .post('/users/login')
        .send(body)
        .expect(401);
      
    });
    /** 로그인이 성공하면 201 */
    it('should return 201 given exist userId', async () => {
      user.password = '$2b$10$KYSaC/sCQosE1pc3nFgcy.yvzyc7oo63/poZycsqi49n0xdA5LMti';
      await usersRepository.save(user);
      
      const body = {
        userId: "wngur89",
        password: "aaaa1234!",
      };

      await request(app.getHttpServer())
        .post('/users/login')
        .send(body)
        .expect(201)
        .expect((res) => {
          expect(res.body.token).toBeDefined();
          token = res.body.token;
        });
      
    });
    /** 토큰이 있다면 expect 200을 return 하는지. */
    it('should return 200 when jwt token is provided', async () => {
      await app.init();

      user.password = '$2b$10$KYSaC/sCQosE1pc3nFgcy.yvzyc7oo63/poZycsqi49n0xdA5LMti';
      await usersRepository.save(user);

      return await request(app.getHttpServer())
        .get('/users/payload')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
        })
      
    });
    /** 토큰이 없을 때, authDecorator가 401 에러를 생성하는지 */
    it("should return 401 given't token value", async () => {
      return await request(app.getHttpServer())
        .get('/users/payload')
        .expect(401);
    });
  });

  afterAll(async () => {
    app.close();
  });
});

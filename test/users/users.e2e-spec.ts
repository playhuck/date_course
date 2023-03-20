import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { SignupUserDto, User } from '../../src/models/_.loader';
import { DataSource } from 'typeorm';

describe('User Module Integration', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async() => {
    const conn = app.get(DataSource);
    await conn.synchronize(true)
  })

  afterAll(async () => {
    app.close();
  });
  /** 회원가입 Flow */
  describe('/users/signup (POST)', () => {
    /** 제일먼저, 비밀번호가 일치하는지 */
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
    /** 회원가입이 성공했는지 */
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
      return await request(app.getHttpServer())
        .post('/users/signup')
        .send(body)
        .expect(400);
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
        .expect(401)
        .expect((res) => {
          expect(res.body.token).toBeDefined();
          token = res.body.token;
        });
    });
    /** 로그인이 성공하면 201 */
    it('should return 201 given exist userId', async () => {
      const body = {
        userId: 'wngur89',
        password: 'aaaa1234!',
      };
      return await request(app.getHttpServer())
        .post('/users/login')
        .send(body)
        .expect(201)
        .expect((res) => {
          expect(res.body.token).toBeDefined();
          token = res.body.token;
        });
    });
    /** 토큰이 없을 때, authDecorator가 401 에러를 생성하는지 */
    it("should return 401 given't token value", async () => {
      return await request(app.getHttpServer())
        .get('/users/protected_resource')
        .expect(401);
    });
    /** 토큰이 있다면 expect 200을 return 하는지. */
    it('should return 200 when jwt token is provided', async () => {
      return await request(app.getHttpServer())
        .get('/users/protected_resource')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(res => {
          expect(res.body.user).toBeDefined();
          expect(res.body.user).toEqual(User);
        });
    });
  });
});

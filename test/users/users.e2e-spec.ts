import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { SignupUserDto } from 'src/models/_.loader';

describe('User Module Integration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    app.close();
  });

  describe('/users/signup (POST)', () => {

    it('should return 201', async() => {
        const body : SignupUserDto = {
            userId : 'wngur89',
            name : 'lay',
            password : 'aaaa1234!',
            passwordCheck : 'aaaa1234!'
        };
        return await request(app.getHttpServer())
        .post('/users/signup')
        .send(body)
        .expect(201)
    })

    it('should return 400 given exist email', async() => {
        const body : SignupUserDto = {
            userId : 'wngur89',
            name : 'lay',
            password : 'aaaa1234!',
            passwordCheck : 'aaaa1234!'
        };
        const res = await request(app.getHttpServer())
        .post('/users/signup')
        .send(body)
        .expect(400);
    })
  })
});

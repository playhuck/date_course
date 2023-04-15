import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  BadRequestException,
  InternalServerErrorException,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import {
  of,
  Observable,
  tap,
  lastValueFrom,
  throwError as observaleThrowError,
  catchError,
} from 'rxjs';
import { AppModule } from 'src/app.module';
import { UsersService } from 'src/routes/users/users.service';
import { MockUsersService } from 'test/mocks/routes/mock.user.service';
import { SignupUserDto, User } from 'src/models/_.loader';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { TransactionInterceptor } from '../../../src/common/interceptors/transaction.interceptor';

describe('UsersService', () => {
  let app: INestApplication;
  let req: any;
  let usersService: UsersService;
  let queryRunnerManager: EntityManager;
  let queryRunner: QueryRunner;
  /** 가짜 Mock DataSource */
  let dataSource: jest.Mocked<DataSource>;
  let callHandler: jest.Mocked<CallHandler>;
  let interceptor: TransactionInterceptor;
  let context: ExecutionContext;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    usersService = moduleRef.get<UsersService>(UsersService);

    dataSource = {
      createQueryRunner: jest.fn(() => ({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: {
          find: jest.fn(),
        },
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      })),
    } as unknown as jest.Mocked<DataSource>;

    interceptor = new TransactionInterceptor(dataSource);
    queryRunner = await interceptor.transcationInit();
    queryRunnerManager = queryRunner.manager;

    console.log("Manager:", queryRunnerManager)
    callHandler = {
      handle: jest.fn(() => of(null)),
    } as unknown as jest.Mocked<CallHandler>;
    // queryRunner = dataSource.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();
  });

  /** UsersService가 정의 됐는지 */
  it('UserService Must Be Define', () => {
    expect(usersService).toBeDefined();
  });

  /** 의존성 수와 메서드가 정의 됐는지 */
  it('UsersService 4 Dependency And 5 Method Define', () => {
    /** 주입받은 종속성 개수 만을 확인 */
    expect(Object.keys(usersService).length).toBe(4);

    /** Defined Dependency */
    expect(usersService['configService']).toBeDefined();
    expect(usersService['dataSource']).toBeDefined();
    expect(usersService['jwtService']).toBeDefined();
    expect(usersService['usersRepository']).toBeDefined();

    /** Defined Method */
    expect(usersService['signup']).toBeDefined();
    expect(usersService['login']).toBeDefined();
    expect(usersService['getPayload']).toBeDefined();
    expect(usersService['getPayload']).toBeDefined();
    expect(usersService['delUser']).toBeDefined();
  });

  describe('Interceptor', () => {
    it('should set query runner manager to the request object', async () => {
      await interceptor.intercept(
        {
          switchToHttp: () => ({ getRequest: () => req }),
        } as unknown as ExecutionContext,
        callHandler,
      );

      expect(queryRunnerManager).toBeDefined();
    });

    it('should call handle method of the call handler', async () => {
      let expected: Observable<any>;
      callHandler.handle.mockReturnValue(of(expected)); // callHandler.handle() 메서드가 Observable<expected>를 반환하도록 모킹

      await interceptor
        .intercept(
          {
            switchToHttp: () => ({ getRequest: () => req }),
          } as unknown as ExecutionContext,
          callHandler,
        )
        .then((result) => {
          expect(result).toBeDefined();
        });
      expect(callHandler.handle).toHaveBeenCalled();
    });

    it('should commit transaction if the request succeeds', async () => {
      const mockNextFn = jest.fn();
      const mockCompleteFn = jest.fn();

      // 인터셉터 호출 및 결과 구독
      const observableResult = await interceptor.intercept(
        {
          switchToHttp: () => ({ getRequest: () => req }),
        } as unknown as ExecutionContext,
        callHandler,
      );

      const result = observableResult.subscribe({
        next() {
          mockNextFn();
        },
        error() {},
        complete() {
          expect(queryRunner.commitTransaction()).toHaveBeenCalled();
        },
      });
    });

    it('should rollback transaction and release query runner if the request fails', async () => {
      callHandler.handle.mockImplementationOnce(() =>
        observaleThrowError(new Error('Something went wrong')),
      );

      await interceptor
        .intercept(
          {
            switchToHttp: () => ({ getRequest: () => req }),
          } as unknown as ExecutionContext,
          callHandler,
        )
        .then((result) => {
          catchError(async (err) => {
            expect(
              result.pipe(
                tap(async () => {
                  expect(
                    req.queryRunnerManager.rollbackTransaction,
                  ).toHaveBeenCalled();
                  expect(req.queryRunnerManager.release).toHaveBeenCalled();
                  expect(err).toBeInstanceOf(InternalServerErrorException);
                }),
              ),
            );
          });
        });
    });
  });

  describe('UsersService.prototype.signup', () => {
    let signupUserDto: SignupUserDto = {
      userId: 'wngur89@gmail.com',
      name: 'Lay',
      password: 'aaaa1234!',
      passwordCheck: 'aaaa1234!',
    };

    /** 비밀번호가 일치하는지, */
    it("PASSWORD NOT'T MATCH, Return BadRequest", async () => {
      signupUserDto.passwordCheck = 'aaaa1234@';
      const jestFunc = jest.fn();
      jestFunc.mockReturnValue(null);

      try {
        await usersService.signup(signupUserDto, queryRunnerManager);

        await queryRunner.commitTransaction();
        await queryRunner.release();
      } catch (err) {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(BadRequestException);

        expect(err instanceof BadRequestException && err.getStatus()).toBe(400);
        expect(err instanceof BadRequestException && err.message).toBe(
          "PASSWORD NOT'T MATCH",
        );
      }
    });
  });

  /** 사용이 끝난 app 객체 정리 */
  afterAll(async () => {
    await app.close();
  });
});

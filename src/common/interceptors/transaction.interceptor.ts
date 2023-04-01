import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(@Inject(DataSource) private readonly dataSource: DataSource) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const queryRunner: QueryRunner = await this.transcationInit();

    req.queryRunnerManager = queryRunner.manager;

    return next.handle().pipe(
      catchError(async (err) => {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();

        if (err instanceof HttpException)
          throw new HttpException(err.message, err.getStatus());
        else throw new InternalServerErrorException(err.message);
      }),
      tap(async () => {
        await queryRunner.commitTransaction();
        await queryRunner.release();
      }),
    );
  }

  async transcationInit(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    return queryRunner;
  }
}

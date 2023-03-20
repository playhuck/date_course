import { DataSource, EntityManager, QueryFailedError } from 'typeorm';
import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  constructor(private dataSource: DataSource) {}

  async catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.rollbackTransaction();

    await queryRunner.release();

    const { response } = error;
    let statusCode = 0;
    if (response === undefined) statusCode = 500;
    else statusCode = response;

    return res.status(statusCode).json({
      message: '서버에서 오류가 발생했습니다.',
      error: error.message,
    });
  }
}

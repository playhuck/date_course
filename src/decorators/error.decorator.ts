import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    console.error(error);
    return res.status(500).json({
      message: '서버에서 오류가 발생했습니다.',
      error,
    });
  }
}

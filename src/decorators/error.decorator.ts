import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
  catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const err = error ? error : res

    const { response } = err 
    const { statusCode } = response;
    
    return res.status(statusCode).json({
      message: '서버에서 오류가 발생했습니다.',
      response,
    });
  }
}

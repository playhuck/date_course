import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** request 객체에 접근 후 담아 둔 manager를 반환 */
export const transactionManager = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const req = ctx.switchToHttp().getRequest();
      return req.queryRunnerManager;
    },
  );
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../models/_.loader'

export const authDecorator = createParamDecorator((data, ctx: ExecutionContext): User => {
    const res = ctx.switchToHttp().getRequest();
    return res.user
})
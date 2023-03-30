import { Controller, UseFilters, UseGuards ,Post, Get, HttpCode } from '@nestjs/common';
import { Body, UseInterceptors } from '@nestjs/common/decorators';
import { LoginUserDto, SignupUserDto, User } from '../models/_.loader';
import { UsersService } from './users.service';
import { HttpExceptionFilter } from '../common/exceptions/catch.exception';
import { currentUser } from '../common/decorators/auth.decorator';
import { transactionManager } from '../common/decorators/transaction.decorator';
import { TransactionInterceptor } from '../common/interceptors/transaction.interceptor';
import { EntityManager } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseFilters(HttpExceptionFilter)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/signup')
  @UseInterceptors(TransactionInterceptor)
  async signup(
    @Body() body: SignupUserDto,
    @transactionManager() queryRunnerManger: EntityManager,
  ) {
    return await this.usersService.signup(body, queryRunnerManger);
  }

  @Post('/login')
  async login(@Body() body: LoginUserDto) {
    return await this.usersService.login(body);
  }

  @Get('/payload')
  @HttpCode(200)
  // @UseInterceptors(TransactionInterceptor)
  @UseGuards(AuthGuard())
  async getPayload(@currentUser() user: User) {
    return await this.usersService.getPayload(user) 
  }
}

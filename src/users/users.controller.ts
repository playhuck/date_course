import { Controller, UseFilters, Post, Get } from '@nestjs/common';
import { Body, UseInterceptors } from '@nestjs/common/decorators';
import { LoginUserDto, SignupUserDto, User } from '../models/_.loader';
import { UsersService } from './users.service';
import { HttpExceptionFilter } from '../common/exceptions/catch.exception';
import { currentUser } from '../common/decorators/auth.decorator';
import { transactionManager } from 'src/common/decorators/transaction.decorator';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { EntityManager } from 'typeorm';

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

  @Get('/protected_resource')
  async protected_resource(@currentUser() user: User) {
    return user;
  }
}

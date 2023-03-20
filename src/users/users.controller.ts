import { Controller, UseFilters ,Post, Get } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { LoginUserDto, SignupUserDto, User } from '../models/_.loader';
import { UsersService } from './users.service';
import { ErrorFilter } from '../common/decorators/error.decorator';
import { authDecorator } from '../common/decorators/auth.decorator';
import { TypeOrmExceptionFilter } from 'src/common/decorators/query.filter.decorator';

@Controller('users')
export class UsersController {

    constructor(private usersService : UsersService){}

    @Post("/signup")
    @UseFilters(TypeOrmExceptionFilter)
    async signup(@Body() body : SignupUserDto){
        return await this.usersService.signup(body);
    }

    @Post('/login')
    @UseFilters(ErrorFilter)
    async login(@Body() body : LoginUserDto){
        return await this.usersService.login(body);
    }

    @Get('/protected_resource')
    @UseFilters(ErrorFilter)
    async protected_resource(@authDecorator() user : User) {
        return user
    }
}

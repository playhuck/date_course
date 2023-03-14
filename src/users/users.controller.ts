import { Controller, UseFilters ,Post } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { LoginUserDto, SignupUserDto } from '../models/_.loader';
import { UsersService } from './users.service';
import { ErrorFilter } from '../decorators/error.decorator';

@Controller('users')
@UseFilters(ErrorFilter)
export class UsersController {

    constructor(private usersService : UsersService){}

    @Post("/signup")
    async signup(@Body() body : SignupUserDto){
        return await this.usersService.signup(body);
    }

    @Post('/login')
    async login(@Body() body : LoginUserDto){
        return await this.usersService.login(body);
    }
}

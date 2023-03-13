import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from "typeorm";

import { User } from "src/models/_.loader";


@Injectable()
export class UsersRepository {
    constructor(@InjectRepository(User) private userRepository : Repository<User>){}
}
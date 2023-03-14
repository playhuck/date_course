import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport/dist/passport.module';

import * as fs from 'fs';
import * as path from 'path';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { MariaModules } from '../modules/maria.modules';

import { JwtStrategyPassport } from '../passports/jwt.passport';

@Module({
  imports: [
    MariaModules,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      privateKey: fs.readFileSync(
        path.join(__dirname, '../../../date_course/private.pem'),
        'utf8',
      ),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, JwtStrategyPassport],
})
export class UsersModule {}

import { MiddlewareConsumer, Module, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport/dist/passport.module';

import * as fs from 'fs';
import * as path from 'path';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MariaModules } from '../common/modules/maria.modules';

import { JwtStrategyPassport } from '../common/passports/jwt.passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../models/_.loader';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';

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
    TypeOrmModule.forFeature([User])
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategyPassport],
  exports: [UsersService, JwtModule, PassportModule]
})
export class UsersModule {
}

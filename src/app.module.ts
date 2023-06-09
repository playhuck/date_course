import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './routes/users/users.module';

import { MariaModules } from './common/modules/maria.modules';
import { PassportModule } from '@nestjs/passport/dist';
import { ValidationPipe } from '@nestjs/common/pipes';
import { CourseModule } from './routes/course/course.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    MariaModules,
    CourseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    /** DTO Validate */
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true }),
    },
  ],
})
export class AppModule {}

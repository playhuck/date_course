import { IsString } from 'class-validator';

export class SignupUserDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;

  @IsString()
  password: string;

  @IsString()
  passwordCheck: string;
}

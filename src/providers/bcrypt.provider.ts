import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptProvider {

  async hash(password: string, saltOrRounds: string | number): Promise<string> {
    return bcrypt.hash(password, saltOrRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
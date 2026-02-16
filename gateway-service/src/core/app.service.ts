import { Injectable } from '@nestjs/common';
import { time, timeStamp } from 'console';

@Injectable()
export class AppService {
  constructor() {}
  //TODO: make cheks
  helthCheck() {
    return { status: 'ok', timeStamp: new Date().toISOString(), message: 'helth check is OK' };
  }
}

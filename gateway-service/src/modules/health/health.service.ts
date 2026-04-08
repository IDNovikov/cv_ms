import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  constructor() {}
  //TODO: make cheks
  helthCheck() {
    return { status: 'ok', timeStamp: new Date().toISOString(), message: 'helth check is OK' };
  }
}

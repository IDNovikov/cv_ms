import { Injectable } from '@nestjs/common';
import { AuthDBPort } from '../providers/prisma/prisma.port';
import { AuthAggregate } from '../domain/auth.aggregate';

@Injectable()
export class AdminService {
  constructor(private readonly db: AuthDBPort) {}

  async getAuthByUserId(id: string): Promise<AuthAggregate | null> {
    return this.db.findByUserId(id);
  }
}

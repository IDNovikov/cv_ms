import { Injectable, NotFoundException } from '@nestjs/common';
import { parsedData, SessionsService } from '../session/session.service';
import { AuthAggregate } from '../domain/auth.aggregate';
import { AuthDBPort } from '../providers/prisma/prisma.port';

@Injectable()
export class AdminFacade {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly auth: AuthDBPort,
  ) {}

  async getAllSessionsByAdmin(): Promise<{ data: parsedData[] }> {
    const sessions = await this.sessionsService.getSessions();
    const parsedSessions = this.sessionsService.parseSessionsData(
      sessions,
      true,
    );
    return { data: parsedSessions };
  }

  async logoutUserSessionsByAdmin(
    userId: string,
  ): Promise<{ message: string }> {
    const sessions = await this.sessionsService.getSessions(userId);

    await Promise.all(
      sessions.map(async (val) => {
        const { deviceId } = this.sessionsService.keyParser(val.key);
        return this.sessionsService.closeSession(
          val.value.jti,
          userId,
          deviceId,
        );
      }),
    );

    return { message: `Session of ${userId} is closed` };
  }

  async logoutAllSessionsByAdmin() {
    const sessions = await this.sessionsService.getSessions();

    await Promise.all(
      sessions.map(async (val) => {
        const { deviceId, userId } = this.sessionsService.keyParser(val.key);
        return this.sessionsService.closeSession(
          val.value.jti,
          userId,
          deviceId,
        );
      }),
    );

    return { message: `All sessions is closed` };
  }

  async getAuthDataByUserId(id: string): Promise<AuthAggregate> {
    const auth = await this.auth.findByUserId(id);
    if (!auth) throw new NotFoundException('Auth data not found');
    return auth;
  }
}

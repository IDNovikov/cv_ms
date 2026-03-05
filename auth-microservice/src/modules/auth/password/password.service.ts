import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { checkPassword } from '../shared/utils/checkPassword.util';

import { HashPort } from '../providers/hash/hash.port';
import { RedisServicePort } from '../providers/redis/redis.port';
import { getRandomPass } from '../shared/utils/getRandomCodes.util';
import { AuthDBPort } from '../providers/prisma/prisma.port';
import { AuthAggregate } from '../domain/auth.aggregate';

@Injectable()
export class PasswordService {
  constructor(
    private auth: AuthDBPort,
    private hash: HashPort,
    private redis: RedisServicePort,
  ) {}

  async getAuthByEmail(email: string): Promise<AuthAggregate> {
    const auth = await this.auth.findByEmail(email);
    if (!auth) throw new NotFoundException('User not found');
    return auth;
  }

  async updateAuthPassword(userId: string, password: string): Promise<void> {
    const { isVaild, message } = checkPassword(password);

    if (!isVaild) {
      throw new ConflictException(message);
    }
    const hashedPassword = await this.hash.hash(password);

    await this.auth.update(userId, {
      password: hashedPassword,
    });
  }

  async checkPasswords(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (oldPassword === newPassword)
      throw new BadRequestException('Passwords must differ');

    const auth = await this.auth.findById(id);
    if (!auth) throw new NotFoundException('User not found');
    if (!auth.password) {
      throw new BadRequestException('User has no password');
    }

    const isCorrectPass = await this.hash.compare(oldPassword, auth.password);
    if (!isCorrectPass) {
      throw new UnauthorizedException('Wrong old password');
    }
  }

  generateNewPassword(): string {
    let tempPass = getRandomPass(10);

    const { isVaild } = checkPassword(tempPass);
    if (!isVaild) {
      tempPass = getRandomPass(10);
    }

    return tempPass;
  }

  async isPasswordSend(email: string): Promise<void> {
    const blockKey = `passChanging:${email}:block`;
    const levelKey = `passChanging:${email}:level`;

    type RedisPasswordChangeValue = { changeAt: number; cooldown: number };
    const block = await this.redis.get<RedisPasswordChangeValue>(blockKey);

    const now = Date.now();

    if (block?.cooldown) {
      const deltaTime = now - block?.changeAt;
      const remain = block?.cooldown;

      throw new BadRequestException(
        `Try again after delta time: ${deltaTime}, remain: ${remain} `,
      );
    }

    const levelStr = await this.redis.get(levelKey);
    const level = levelStr ? Number(levelStr) : 0;

    const cooldown: number = 3;

    const blockPayload: RedisPasswordChangeValue = {
      changeAt: now,
      cooldown,
    };
    await this.redis.set(blockKey, blockPayload, Math.floor(cooldown / 1000));

    await this.redis.set(levelKey, String(level + 1), 30 * 24 * 60 * 60);

    return;
  }
}

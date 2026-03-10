import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { checkPassword } from '../shared/utils/checkPassword.util';
import { get6NumberCode } from '../shared/utils/getRandomCodes.util';
import { UserRpcPort } from '../providers/user-rpc/user-rpc.port';
import { RabbitServicePort } from '../providers/amqp/amqp.port';
import { RedisServicePort } from '../providers/redis/redis.port';
import { HashPort } from '../providers/hash/hash.port';
import { AuthAggregate } from '../domain/auth.aggregate';
import { AuthDBPort } from '../providers/prisma/prisma.port';
import { IAuth } from '../domain/auth.interface';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly user: UserRpcPort,
    private readonly mail: RabbitServicePort,
    private readonly redis: RedisServicePort,
    private readonly hash: HashPort,
    private readonly authDB: AuthDBPort,
  ) {}

  async sendEmailCode(
    email: string,
  ): Promise<{ code: string; codeExpired: Date }> {
    const code = get6NumberCode();
    const codeExpired = new Date(Date.now() + 10 * 60 * 1000);
    await this.mail.AmqpSendMail({ email, code });
    await this.redis.set(email, { code, codeExpired }, 1800);
    return { code, codeExpired };
  }

  async registrate(
    userName: string,
    password: string,
    email: string,
  ): Promise<AuthAggregate> {
    const { isVaild, message } = checkPassword(password);
    if (!isVaild || message) throw new ConflictException(message);

    const hashed = await this.hash.hash(password);

    const { user } = await this.user.createUser({
      userName,
      telegramId: '',
      userImage: '',
    });

    if (!user) throw new ForbiddenException('User not created');

    const createdAuth = AuthAggregate.create({
      userId: user.id,
      email: email,
      password: hashed,
    });

    const existedAuth = await this.authDB.save(createdAuth);
    if (!existedAuth) throw new ForbiddenException('Account not created');
    return existedAuth;
  }

  async verifyEmail(
    id: string,
    email: string,
    code: string,
  ): Promise<AuthAggregate> {
    const validData = await this.redis.get<{
      code: string;
      codeExpired: Date;
    }>(email);

    if (!validData?.code) {
      throw new ForbiddenException('Verification code is missing');
    }

    if (!validData?.codeExpired || validData.code !== code) {
      throw new ForbiddenException('Verification code is not actual');
    }
    if (validData.codeExpired <= new Date()) {
      throw new ForbiddenException('Verification code has expired');
    }
    await this.redis.del(email);

    const UPDATED = await this.authDB.update(id, { isEmailVerified: true });

    if (!UPDATED) throw new ForbiddenException('Not updated entity');

    return UPDATED;
  }

  async checkIsAuthVerified(email: string): Promise<AuthAggregate> {
    const auth = await this.authDB.findByEmail(email);

    if (!auth) throw new NotFoundException('User not found');
    if (auth?.isEmailVerified) {
      throw new ForbiddenException('Email is already verifiyed');
    }

    return auth;
  }
}

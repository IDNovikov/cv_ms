import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';
import { PrismaService } from 'src/modules/core/prisma/prisma.service';
import { UserAggregate } from '../../domain';
import { Paginated, UserDBPort } from './prisma.port';
import { DependencyUnavailableError } from 'src/common/errors';

@Injectable()
export class UserDBAdapter extends UserDBPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(user: UserAggregate): Promise<UserAggregate> {
    try {
      const data = user.toPersistence();
      const row = await this.prisma.user.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          email: data.email,
          userName: data.userName,
          telegramId: data.telegramId,
          userImage: data.userImage,
        },
        update: {
          email: data.email,
          userName: data.userName,
          telegramId: data.telegramId,
          userImage: data.userImage,
        },
      });

      return UserAggregate.restore(row);
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'save' },
        error,
      );
    }
  }

  async findById(id: string): Promise<UserAggregate | null> {
    try {
      const row = await this.prisma.user.findUnique({ where: { id } });
      return row ? UserAggregate.restore(row) : null;
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'findById' },
        error,
      );
    }
  }

  async findByUserName(userName: string): Promise<UserAggregate | null> {
    try {
      const row = await this.prisma.user.findUnique({
        where: { userName: userName.trim() },
      });
      return row ? UserAggregate.restore(row) : null;
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'findByUserName' },
        error,
      );
    }
  }

  async findAll(
    dto: Paginated,
  ): Promise<{ data: UserAggregate[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        order = 'desc',
        search,
      } = dto;

      const where: Prisma.UserWhereInput = search?.trim()
        ? {
            OR: [
              { userName: { contains: search.trim(), mode: 'insensitive' } },
              { telegramId: { contains: search.trim(), mode: 'insensitive' } },
            ],
          }
        : {};

      const [items, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          orderBy: { [sortBy]: order },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.user.count({ where }),
      ]);

      return { data: items.map((el) => UserAggregate.restore(el)), total };
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'findAll' },
        error,
      );
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const deleted = await this.prisma.user.deleteMany({ where: { id } });
      return deleted.count > 0;
    } catch (error) {
      throw new DependencyUnavailableError(
        'prisma',
        { operation: 'delete' },
        error,
      );
    }
  }
}

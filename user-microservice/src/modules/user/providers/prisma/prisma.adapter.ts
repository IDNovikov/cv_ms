import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';
import { PrismaService } from 'src/modules/core/prisma/prisma.service';
import {
  ConflictAppError,
  DependencyUnavailableError,
  NotFoundAppError,
  PersistenceError,
} from 'src/common/errors';
import { UserAggregate } from '../../domain';
import { Paginated, UserDBPort } from './prisma.port';

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
          userName: data.userName,
          telegramId: data.telegramId,
          userImage: data.userImage,
        },
        update: {
          userName: data.userName,
          telegramId: data.telegramId,
          userImage: data.userImage,
        },
      });

      return UserAggregate.restore(row);
    } catch (error) {
      this.handlePrismaError(error, 'save user');
    }
  }

  async findById(id: string): Promise<UserAggregate | null> {
    try {
      const row = await this.prisma.user.findUnique({ where: { id } });
      return row ? UserAggregate.restore(row) : null;
    } catch (error) {
      this.handlePrismaError(error, 'find user by id');
    }
  }

  async findByUserName(userName: string): Promise<UserAggregate | null> {
    try {
      const row = await this.prisma.user.findUnique({
        where: { userName: userName.trim() },
      });
      return row ? UserAggregate.restore(row) : null;
    } catch (error) {
      this.handlePrismaError(error, 'find user by userName');
    }
  }

  async findAll(
    dto: Paginated,
  ): Promise<{ data: UserAggregate[]; total: number }> {
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

    try {
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
      this.handlePrismaError(error, 'list users');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const deleted = await this.prisma.user.deleteMany({ where: { id } });
      return deleted.count > 0;
    } catch (error) {
      this.handlePrismaError(error, 'delete user');
    }
  }

  private handlePrismaError(error: unknown, operation: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target)
          ? error.meta?.target
          : [String(error.meta?.target ?? 'unique_field')];
        throw new ConflictAppError('User', { operation, target });
      }

      if (error.code === 'P2025') {
        throw new NotFoundAppError('User', { operation });
      }

      if (error.code === 'P1001' || error.code === 'P1008') {
        throw new DependencyUnavailableError(
          'postgres',
          { operation, prismaCode: error.code },
          error,
        );
      }
    }

    throw new PersistenceError(`Prisma operation failed: ${operation}`, {}, error);
  }
}

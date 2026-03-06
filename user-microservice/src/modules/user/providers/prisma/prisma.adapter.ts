import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/client';
import { PrismaService } from 'src/modules/core/prisma/prisma.service';
import { UserAggregate } from '../../domain';
import { Paginated, UserDBPort } from './prisma.port';

@Injectable()
export class UserDBAdapter extends UserDBPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(user: UserAggregate): Promise<UserAggregate> {
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
  }

  async findById(id: string): Promise<UserAggregate | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? UserAggregate.restore(row) : null;
  }

  async findByUserName(userName: string): Promise<UserAggregate | null> {
    const row = await this.prisma.user.findUnique({
      where: { userName: userName.trim() },
    });
    return row ? UserAggregate.restore(row) : null;
  }

  async findAll(dto: Paginated): Promise<{ data: UserAggregate[]; total: number }> {
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
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.prisma.user.deleteMany({ where: { id } });
    return deleted.count > 0;
  }
}

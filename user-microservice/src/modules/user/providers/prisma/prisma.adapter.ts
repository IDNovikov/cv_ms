import { PrismaService } from 'src/modules/core/prisma/prisma.service';
import { UserDBPort, Paginated, TxFn } from './prisma.port';
import { UserAggregate } from '../../domain';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/browser';

@Injectable()
export class UserDBAdapter extends UserDBPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(actor: UserAggregate): Promise<UserAggregate> {
    const row = await this.prisma.actor.upsert({
      where: { id: actor.id },
      create: {
        id: actor.id,
        author: actor.author,
        createdAt: actor.createdAt,
        updatedAt: actor.updatedAt,
      },
      update: {
        author: actor.author,
        updatedAt: actor.updatedAt,
      },
    });

    return UserAggregate.restore(row);
  }

  async findById(id: string): Promise<UserAggregate | null> {
    const row = await this.prisma.actor.findUnique({ where: { id } });
    return row ? UserAggregate.restore(row) : null;
  }

  async findAll<TSort extends string>(
    dto: Paginated<TSort>,
  ): Promise<{ data: UserAggregate[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt' as any,
      order = 'desc' as any,
      search,
    } = dto;
    const where: Prisma.ActorWhereInput = search
      ? {
          OR: [{ author: { contains: search, mode: 'insensitive' } }],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.actor.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.actor.count({ where }),
    ]);

    return { data: items.map(UserAggregate.restore), total };
  }

  // async transaction<T>(fn: TxFn<userRepository, T>): Promise<T> {
  //   return this.prisma.transaction(async (tx) => {
  //     const txRepo = new PrismaActorRepository(tx);
  //     return fn(txRepo);
  //   });
  // }
}


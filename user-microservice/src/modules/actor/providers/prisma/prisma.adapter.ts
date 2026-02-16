import { PrismaService } from 'src/modules/core/prisma/prisma.service';
import { ActorDBPort, Paginated, TxFn } from './prisma.port';
import { ActorAggregate } from '../../domain';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/browser';

@Injectable()
export class ActorDBAdapter extends ActorDBPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(actor: ActorAggregate): Promise<ActorAggregate> {
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

    return ActorAggregate.restore(row);
  }

  async findById(id: string): Promise<ActorAggregate | null> {
    const row = await this.prisma.actor.findUnique({ where: { id } });
    return row ? ActorAggregate.restore(row) : null;
  }

  async findAll<TSort extends string>(
    dto: Paginated<TSort>,
  ): Promise<{ data: ActorAggregate[]; total: number }> {
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

    return { data: items.map(ActorAggregate.restore), total };
  }

  // async transaction<T>(fn: TxFn<ActorRepository, T>): Promise<T> {
  //   return this.prisma.transaction(async (tx) => {
  //     const txRepo = new PrismaActorRepository(tx);
  //     return fn(txRepo);
  //   });
  // }
}

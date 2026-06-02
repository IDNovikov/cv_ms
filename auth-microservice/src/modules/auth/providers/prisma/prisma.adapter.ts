import { PrismaService } from 'src/modules/core/prisma/prisma.service';
import { AuthDBPort, Paginated } from './prisma.port';
import { Injectable } from '@nestjs/common';
import { AuthAggregate } from '../../domain/auth.aggregate';
import { Prisma } from '@prisma/client';

@Injectable()
export class ActorDBAdapter extends AuthDBPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(auth: AuthAggregate): Promise<AuthAggregate> {
    const row = await this.prisma.auth.upsert({
      where: { id: auth.id },
      create: {
        id: auth.id,
        userId: auth.userId,
        email: auth.email,
        isEmailVerified: auth.isEmailVerified,
        role: auth.role,
        status: auth.status,
        password: auth.password,
        createdAt: auth.createdAt,
        updatedAt: auth.updatedAt,
      },
      update: {
        email: auth.email,
        isEmailVerified: auth.isEmailVerified,
        role: auth.role,
        status: auth.status,
        password: auth.password,
        updatedAt: auth.updatedAt,
      },
    });

    return AuthAggregate.restore(row);
  }

  async findById(id: string): Promise<AuthAggregate | null> {
    const row = await this.prisma.auth.findUnique({ where: { id } });
    return row ? AuthAggregate.restore(row) : null;
  }

  async findByUserId(id: string): Promise<AuthAggregate | null> {
    const row = await this.prisma.auth.findUnique({ where: { userId: id } });
    return row ? AuthAggregate.restore(row) : null;
  }

  async findAll<TSort extends string>(
    dto: Paginated<TSort>,
  ): Promise<{ data: AuthAggregate[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt' as any,
      order = 'desc' as any,
      search,
    } = dto;
    const where: Prisma.AuthWhereInput = search
      ? {
          OR: [{ email: { contains: search, mode: 'insensitive' } }],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.auth.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auth.count({ where }),
    ]);

    return { data: items.map((el) => AuthAggregate.restore(el)), total };
  }

  async update(id, data) {
    const row = await this.prisma.auth.update({
      where: { id },
      data: {
        ...data,
      },
    });

    return AuthAggregate.restore(row);
  }

  async findByEmail(email: string): Promise<AuthAggregate | null> {
    const row = await this.prisma.auth.findUnique({ where: { email } });
    return row ? AuthAggregate.restore(row) : null;
  }
}

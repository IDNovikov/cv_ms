import { Body, Controller, Delete, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FacadePort } from '../../providers/facade/facade.port';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { UseSwagger } from '@/common/decorators/swagger.decorator';
import { UsersSwagger } from '../docs/userSwagger.docs';
import { User } from '@/common/decorators/userRefreshToken.decorator';
import { UserQueryDto } from '../dto/user-query.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userFacade: FacadePort) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @UseSwagger(...UsersSwagger.getMe)
  async getMe(@User() user: { sub: string }) {
    return this.userFacade.getUserById({ id: user.sub });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @UseSwagger(...UsersSwagger.GetUserById)
  async getUserById(@Param('id') id: string) {
    return this.userFacade.getUserById({ id });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @UseSwagger(...UsersSwagger.GetUsers)
  async getUsers(@Query() q: UserQueryDto) {
    const result = await this.userFacade.listUsers({
      page: q.page ?? 1,
      limit: q.limit ?? 20,
      sortBy: q.sortBy ?? 'createdAt',
      order: q.order ?? 'desc',
      search: q.search ?? '',
    });

    return {
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  @UseSwagger(...UsersSwagger.UpdateUser)
  async update(@User() user: { sub: string }, @Body() body: UpdateUserDto) {
    return this.userFacade.updateUser({
      id: user.sub,
      userName: body.userName,
      telegramId: body.telegramId,
      userImage: body.userImage,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @UseSwagger(...UsersSwagger.DeleteUser)
  async deleteUser(@Param('id') id: string) {
    return this.userFacade.deleteUser({ id });
  }
}

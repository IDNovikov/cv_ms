import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FacadePort } from "../../providers/facade/facade.port";
import { JwtAuthGuard } from "@/shared/guards/jwt-auth.guard";
import { UseSwagger } from "@/common/decorators/swagger.decorator";
import { UsersSwagger } from "../docs/userSwagger.docs";
import { User } from "@/common/decorators/userRefreshToken.decorator";
import { UserQueryDto } from "../dto/user-query.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { RolesGuard } from "@/shared/guards/roles.guard";
import { Roles } from "@/shared/decorators/roles.decorator";


@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private userFacade: FacadePort,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @UseSwagger(...UsersSwagger.getMe)
  async getMe(@User() userId: { sub: string }) {
     return  this.userFacade.getUser(userId.sub),
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @UseSwagger(...UsersSwagger.GetUserById)
  async getUserById(@Param('id') id: string) {
    return this.userFacade.getUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @UseSwagger(...UsersSwagger.GetUsers)
  async getUsers(@Query() q: UserQueryDto) {
    const { data, total } = await this.userFacade.getUsers(q);

    return {
      items: data,
      total,
      page: q.page,
      limit: q.limit,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  @UseSwagger(...UsersSwagger.UpdateUser)
  async update(@User() userId: { sub: string }, @Body() body: UpdateUserDto) {
    return  this.userFacade.updateUser({ id: userId.sub }, body)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @UseSwagger(...UsersSwagger.DeleteUser)
  async deleteUser(@Param('id', ) id: string) {
    return this.userFacade.deleteUser(id);
  }
}

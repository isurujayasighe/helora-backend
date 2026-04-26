import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentUserContext } from '../common/types/current-user-context.type';

import { CreateGroupOrderDto } from './dto/create-group-order.dto';
import { UpdateGroupOrderDto } from './dto/update-group-order.dto';
import { ListGroupOrdersDto } from './dto/list-group-orders.dto';
import { GroupOrderLookupDto } from './dto/group-order-lookup.dto';
import { MarkGroupOrderDeliveredDto } from './dto/mark-group-order-delivered.dto';

import { CreateGroupOrderCommand } from './commands/impl/create-group-order.command';
import { UpdateGroupOrderCommand } from './commands/impl/update-group-order.command';
import { DeleteGroupOrderCommand } from './commands/impl/delete-group-order.command';
import { MarkGroupOrderDeliveredCommand } from './commands/impl/mark-group-order-delivered.command';

import { ListGroupOrdersQuery } from './queries/impl/list-group-orders.query';
import { GetGroupOrderByIdQuery } from './queries/impl/get-group-order-by-id.query';
import { GroupOrderLookupQuery } from './queries/impl/group-order-lookup.query';

@ApiTags('Group Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('group-orders')
export class GroupOrdersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Version('1')
  @Permissions('orders:create')
  @Post()
  async create(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateGroupOrderDto,
  ) {
    return this.commandBus.execute(
      new CreateGroupOrderCommand(currentUser, body),
    );
  }

  @Version('1')
  @Permissions('orders:read')
  @Get('lookup')
  async lookup(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: GroupOrderLookupDto,
  ) {
    return this.queryBus.execute(new GroupOrderLookupQuery(currentUser, query));
  }

  @Version('1')
  @Permissions('orders:read')
  @Get()
  async list(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListGroupOrdersDto,
  ) {
    return this.queryBus.execute(new ListGroupOrdersQuery(currentUser, query));
  }

  @Version('1')
  @Permissions('orders:read')
  @Get(':id')
  async getById(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('id') id: string,
  ) {
    return this.queryBus.execute(new GetGroupOrderByIdQuery(currentUser, id));
  }

  @Version('1')
  @Permissions('orders:update')
  @Patch(':id')
  async update(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('id') id: string,
    @Body() body: UpdateGroupOrderDto,
  ) {
    return this.commandBus.execute(
      new UpdateGroupOrderCommand(currentUser, id, body),
    );
  }

  @Version('1')
  @Permissions('orders:update')
  @Patch(':id/mark-delivered')
  async markDelivered(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('id') id: string,
    @Body() body: MarkGroupOrderDeliveredDto,
  ) {
    return this.commandBus.execute(
      new MarkGroupOrderDeliveredCommand(currentUser, id, body),
    );
  }

  @Version('1')
  @Permissions('orders:delete')
  @Delete(':id')
  async remove(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('id') id: string,
  ) {
    return this.commandBus.execute(new DeleteGroupOrderCommand(currentUser, id));
  }
}

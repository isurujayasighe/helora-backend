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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { CurrentUserContext } from '../common/types/current-user-context.type';

import { CreateOrderCommand } from './commands/impl/create-order.command';
import { DeleteOrderCommand } from './commands/impl/delete-order.command';
import { UpdateOrderCommand } from './commands/impl/update-order.command';

import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

import { GetOrderByIdQuery } from './queries/impl/get-order-by-id.query';
import { ListOrdersQuery } from './queries/impl/list-orders.query';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Version('1')
  @Permissions('orders:create')
  @Post()
  async create(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateOrderDto,
  ) {
    return this.commandBus.execute(new CreateOrderCommand(currentUser, body));
  }

  @Version('1')
  @Permissions('orders:read')
  @Get()
  async list(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListOrdersDto,
  ) {
    return this.queryBus.execute(new ListOrdersQuery(currentUser, query));
  }

  @Version('1')
  @Permissions('orders:read')
  @Get(':id')
  async getById(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('id') id: string,
  ) {
    return this.queryBus.execute(new GetOrderByIdQuery(currentUser, id));
  }

  @Version('1')
  @Permissions('orders:update')
  @Patch(':id')
  async update(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('id') id: string,
    @Body() body: UpdateOrderDto,
  ) {
    return this.commandBus.execute(
      new UpdateOrderCommand(currentUser, id, body),
    );
  }

  @Version('1')
  @Permissions('orders:delete')
  @Delete(':id')
  async remove(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param('id') id: string,
  ) {
    return this.commandBus.execute(new DeleteOrderCommand(currentUser, id));
  }
}
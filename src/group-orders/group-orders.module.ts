import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { GroupOrdersController } from './group-orders.controller';
import { GroupOrdersService } from './group-orders.service';

import { CreateGroupOrderHandler } from './commands/handlers/create-group-order.handler';
import { UpdateGroupOrderHandler } from './commands/handlers/update-group-order.handler';
import { DeleteGroupOrderHandler } from './commands/handlers/delete-group-order.handler';
import { MarkGroupOrderDeliveredHandler } from './commands/handlers/mark-group-order-delivered.handler';

import { ListGroupOrdersHandler } from './queries/handlers/list-group-orders.handler';
import { GetGroupOrderByIdHandler } from './queries/handlers/get-group-order-by-id.handler';
import { GroupOrderLookupHandler } from './queries/handlers/group-order-lookup.handler';

const CommandHandlers = [
  CreateGroupOrderHandler,
  UpdateGroupOrderHandler,
  DeleteGroupOrderHandler,
  MarkGroupOrderDeliveredHandler,
];

const QueryHandlers = [
  ListGroupOrdersHandler,
  GetGroupOrderByIdHandler,
  GroupOrderLookupHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [GroupOrdersController],
  providers: [GroupOrdersService, ...CommandHandlers, ...QueryHandlers],
  exports: [GroupOrdersService],
})
export class GroupOrdersModule {}

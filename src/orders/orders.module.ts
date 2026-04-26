import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { GroupOrdersModule } from '../group-orders/group-orders.module';

import { CreateOrderHandler } from './commands/handlers/create-order.handler';
import { UpdateOrderHandler } from './commands/handlers/update-order.handler';
import { DeleteOrderHandler } from './commands/handlers/delete-order.handler';

import { ListOrdersHandler } from './queries/handlers/list-orders.handler';
import { GetOrderByIdHandler } from './queries/handlers/get-order-by-id.handler';

const CommandHandlers = [
  CreateOrderHandler,
  UpdateOrderHandler,
  DeleteOrderHandler,
];

const QueryHandlers = [
  ListOrdersHandler,
  GetOrderByIdHandler,
];

@Module({
  imports: [CqrsModule, GroupOrdersModule],
  controllers: [OrdersController],
  providers: [OrdersService, ...CommandHandlers, ...QueryHandlers],
  exports: [OrdersService],
})
export class OrdersModule {}
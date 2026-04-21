import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderHandler } from './commands/handlers/create-order.handler';
import { UpdateOrderHandler } from './commands/handlers/update-order.handler';
import { DeleteOrderHandler } from './commands/handlers/delete-order.handler';
import { ListOrdersHandler } from './queries/handlers/list-orders.handler';
import { GetOrderByIdHandler } from './queries/handlers/get-order-by-id.handler';

const commandHandlers = [CreateOrderHandler, UpdateOrderHandler, DeleteOrderHandler];
const queryHandlers = [ListOrdersHandler, GetOrderByIdHandler];

@Module({
  imports: [CqrsModule],
  controllers: [OrdersController],
  providers: [OrdersService, ...commandHandlers, ...queryHandlers],
  exports: [OrdersService],
})
export class OrdersModule {}

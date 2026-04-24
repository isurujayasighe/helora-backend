import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrdersService } from '../../orders.service';
import { CreateOrderCommand } from '../impl/create-order.command';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(private readonly ordersService: OrdersService) {}

  async execute(command: CreateOrderCommand) {
    const order = await this.ordersService.createOrder({
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,
      ...command.payload,
    });

    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    };
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrdersService } from '../../orders.service';
import { UpdateOrderCommand } from '../impl/update-order.command';

@CommandHandler(UpdateOrderCommand)
export class UpdateOrderHandler implements ICommandHandler<UpdateOrderCommand> {
  constructor(private readonly ordersService: OrdersService) {}

  async execute(command: UpdateOrderCommand) {
    const order = await this.ordersService.updateOrder({
      id: command.id,
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,
      ...command.payload,
    });

    return {
      success: true,
      message: 'Order updated successfully',
      data: order,
    };
  }
}

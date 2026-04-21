import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrdersService } from '../../orders.service';
import { DeleteOrderCommand } from '../impl/delete-order.command';

@CommandHandler(DeleteOrderCommand)
export class DeleteOrderHandler implements ICommandHandler<DeleteOrderCommand> {
  constructor(private readonly ordersService: OrdersService) {}

  async execute(command: DeleteOrderCommand) {
    await this.ordersService.deleteOrder({
      id: command.id,
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.sub,
    });

    return {
      success: true,
      message: 'Order deleted successfully',
    };
  }
}

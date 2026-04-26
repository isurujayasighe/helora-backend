import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GroupOrdersService } from '../../group-orders.service';
import { MarkGroupOrderDeliveredCommand } from '../impl/mark-group-order-delivered.command';

@CommandHandler(MarkGroupOrderDeliveredCommand)
export class MarkGroupOrderDeliveredHandler
  implements ICommandHandler<MarkGroupOrderDeliveredCommand>
{
  constructor(private readonly groupOrdersService: GroupOrdersService) {}

  async execute(command: MarkGroupOrderDeliveredCommand) {
    const groupOrder = await this.groupOrdersService.markDelivered({
      id: command.id,
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,
      notes: command.payload.notes,
    });

    return {
      success: true,
      message: 'Group order marked as delivered',
      data: groupOrder,
    };
  }
}

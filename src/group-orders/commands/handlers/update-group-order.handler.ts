import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GroupOrdersService } from '../../group-orders.service';
import { UpdateGroupOrderCommand } from '../impl/update-group-order.command';

@CommandHandler(UpdateGroupOrderCommand)
export class UpdateGroupOrderHandler
  implements ICommandHandler<UpdateGroupOrderCommand>
{
  constructor(private readonly groupOrdersService: GroupOrdersService) {}

  async execute(command: UpdateGroupOrderCommand) {
    const groupOrder = await this.groupOrdersService.updateGroupOrder({
      id: command.id,
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,
      ...command.payload,
    });

    return {
      success: true,
      message: 'Group order updated successfully',
      data: groupOrder,
    };
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GroupOrdersService } from '../../group-orders.service';
import { DeleteGroupOrderCommand } from '../impl/delete-group-order.command';

@CommandHandler(DeleteGroupOrderCommand)
export class DeleteGroupOrderHandler
  implements ICommandHandler<DeleteGroupOrderCommand>
{
  constructor(private readonly groupOrdersService: GroupOrdersService) {}

  async execute(command: DeleteGroupOrderCommand) {
    await this.groupOrdersService.deleteGroupOrder({
      id: command.id,
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,
    });

    return {
      success: true,
      message: 'Group order deleted successfully',
    };
  }
}

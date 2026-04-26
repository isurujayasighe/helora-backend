import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GroupOrdersService } from '../../group-orders.service';
import { CreateGroupOrderCommand } from '../impl/create-group-order.command';

@CommandHandler(CreateGroupOrderCommand)
export class CreateGroupOrderHandler
  implements ICommandHandler<CreateGroupOrderCommand>
{
  constructor(private readonly groupOrdersService: GroupOrdersService) {}

  async execute(command: CreateGroupOrderCommand) {
    const groupOrder = await this.groupOrdersService.createGroupOrder({
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,
      ...command.payload,
    });

    return {
      success: true,
      message: 'Group order created successfully',
      data: groupOrder,
    };
  }
}

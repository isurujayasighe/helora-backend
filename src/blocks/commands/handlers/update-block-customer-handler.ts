import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlocksService } from '../../blocks.service';
import { UpdateBlockCustomersCommand } from '../impl/update-block-customer-command';

@CommandHandler(UpdateBlockCustomersCommand)
export class UpdateBlockCustomersHandler
  implements ICommandHandler<UpdateBlockCustomersCommand>
{
  constructor(private readonly blocksService: BlocksService) {}

  async execute(command: UpdateBlockCustomersCommand) {
    const block = await this.blocksService.updateBlockCustomers({
      tenantId: command.currentUser.tenantId,
      blockId: command.blockId,
      customers: command.dto.customers,
      actorUserId: command.currentUser.userId,
    });

    return {
      success: true,
      data: block,
    };
  }
}
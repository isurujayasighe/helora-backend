import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteBlockCommand } from '../impl/delete-block.command';
import { BlocksService } from '../../blocks.service';

@CommandHandler(DeleteBlockCommand)
export class DeleteBlockHandler implements ICommandHandler<DeleteBlockCommand> {
  constructor(private readonly blocksService: BlocksService) {}

  async execute(command: DeleteBlockCommand) {
    await this.blocksService.deleteBlock({
      id: command.id,
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.sub,
    });

    return {
      success: true,
      message: 'Block deleted successfully',
    };
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlockCommand } from '../impl/update-block.command';
import { BlocksService } from '../../blocks.service';

@CommandHandler(UpdateBlockCommand)
export class UpdateBlockHandler implements ICommandHandler<UpdateBlockCommand> {
  constructor(private readonly blocksService: BlocksService) {}

  async execute(command: UpdateBlockCommand) {
    const block = await this.blocksService.updateBlock({
      id: command.id,
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.sub,
      ...command.payload,
    });

    return {
      success: true,
      message: 'Block updated successfully',
      data: block,
    };
  }
}

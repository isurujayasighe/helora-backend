import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlockCommand } from '../impl/create-block.command';
import { BlocksService } from '../../blocks.service';

@CommandHandler(CreateBlockCommand)
export class CreateBlockHandler implements ICommandHandler<CreateBlockCommand> {
  constructor(private readonly blocksService: BlocksService) {}

  async execute(command: CreateBlockCommand) {
    const block = await this.blocksService.createBlock({
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.sub,
      ...command.payload,
    });

    return {
      success: true,
      message: 'Block created successfully',
      data: block,
    };
  }
}

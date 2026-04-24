import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlockCommand } from '../impl/create-block.command';
import { BlocksService } from '../../blocks.service';

@CommandHandler(CreateBlockCommand)
export class CreateBlockHandler implements ICommandHandler<CreateBlockCommand> {
  constructor(private readonly blocksService: BlocksService) {}

  async execute(command: CreateBlockCommand) {
    const block = await this.blocksService.createBlock({
      tenantId: command.currentUser.tenantId,
      categoryId: command.dto.categoryId,
      blockNumber: command.dto.blockNumber,
      readyMadeSize: command.dto.readyMadeSize,
      sizeLabel: command.dto.sizeLabel,
      fitNotes: command.dto.fitNotes,
      versionNo: command.dto.versionNo,
      previousBlockId: command.dto.previousBlockId,
      description: command.dto.description,
      status: command.dto.status,
      remarks: command.dto.remarks,
      legacyId: command.dto.legacyId,
      customers: command.dto.customers,
      actorUserId: command.currentUser.userId,
    });

    return {
      success: true,
      data: block,
    };
  }
}
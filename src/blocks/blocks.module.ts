import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { CreateBlockHandler } from './commands/handlers/create-block.handler';
import { UpdateBlockHandler } from './commands/handlers/update-block.handler';
import { DeleteBlockHandler } from './commands/handlers/delete-block.handler';
import { ListBlocksHandler } from './queries/handlers/list-blocks.handler';
import { GetBlockByIdHandler } from './queries/handlers/get-block-by-id.handler';

const commandHandlers = [CreateBlockHandler, UpdateBlockHandler, DeleteBlockHandler];
const queryHandlers = [ListBlocksHandler, GetBlockByIdHandler];

@Module({
  imports: [CqrsModule],
  controllers: [BlocksController],
  providers: [BlocksService, ...commandHandlers, ...queryHandlers],
})
export class BlocksModule {}

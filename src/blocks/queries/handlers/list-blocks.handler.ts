import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListBlocksQuery } from '../impl/list-blocks.query';
import { BlocksService } from '../../blocks.service';

@QueryHandler(ListBlocksQuery)
export class ListBlocksHandler implements IQueryHandler<ListBlocksQuery> {
  constructor(private readonly blocksService: BlocksService) {}

  async execute(query: ListBlocksQuery) {
    const result = await this.blocksService.listBlocks({
      tenantId: query.currentUser.tenantId,
      ...query.filters,
    });

    return {
      success: true,
      data: result,
    };
  }
}
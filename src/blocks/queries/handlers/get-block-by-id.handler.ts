import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBlockByIdQuery } from '../impl/get-block-by-id.query';
import { BlocksService } from '../../blocks.service';

@QueryHandler(GetBlockByIdQuery)
export class GetBlockByIdHandler implements IQueryHandler<GetBlockByIdQuery> {
  constructor(private readonly blocksService: BlocksService) {}

  async execute(query: GetBlockByIdQuery) {
    const block = await this.blocksService.getBlockById({
      id: query.id,
      tenantId: query.currentUser.tenantId,
    });

    return {
      success: true,
      data: block,
    };
  }
}

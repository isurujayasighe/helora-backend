import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupOrdersService } from '../../group-orders.service';
import { GetGroupOrderByIdQuery } from '../impl/get-group-order-by-id.query';

@QueryHandler(GetGroupOrderByIdQuery)
export class GetGroupOrderByIdHandler
  implements IQueryHandler<GetGroupOrderByIdQuery>
{
  constructor(private readonly groupOrdersService: GroupOrdersService) {}

  async execute(query: GetGroupOrderByIdQuery) {
    const groupOrder = await this.groupOrdersService.getGroupOrderById({
      id: query.id,
      tenantId: query.currentUser.tenantId,
    });

    return {
      success: true,
      data: groupOrder,
    };
  }
}

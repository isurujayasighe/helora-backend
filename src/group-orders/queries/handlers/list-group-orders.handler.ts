import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupOrdersService } from '../../group-orders.service';
import { ListGroupOrdersQuery } from '../impl/list-group-orders.query';

@QueryHandler(ListGroupOrdersQuery)
export class ListGroupOrdersHandler
  implements IQueryHandler<ListGroupOrdersQuery>
{
  constructor(private readonly groupOrdersService: GroupOrdersService) {}

  async execute(query: ListGroupOrdersQuery) {
    const result = await this.groupOrdersService.listGroupOrders({
      tenantId: query.currentUser.tenantId,
      ...query.filters,
    });

    return {
      success: true,
      data: result,
    };
  }
}

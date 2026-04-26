import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupOrdersService } from '../../group-orders.service';
import { GroupOrderLookupQuery } from '../impl/group-order-lookup.query';

@QueryHandler(GroupOrderLookupQuery)
export class GroupOrderLookupHandler
  implements IQueryHandler<GroupOrderLookupQuery>
{
  constructor(private readonly groupOrdersService: GroupOrdersService) {}

  async execute(query: GroupOrderLookupQuery) {
    const groupOrders = await this.groupOrdersService.lookupGroupOrders({
      tenantId: query.currentUser.tenantId,
      search: query.filters.search,
      limit: query.filters.limit,
    });

    return {
      success: true,
      data: groupOrders,
    };
  }
}

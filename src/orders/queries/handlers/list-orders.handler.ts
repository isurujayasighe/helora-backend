import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { OrdersService } from '../../orders.service';
import { ListOrdersQuery } from '../impl/list-orders.query';

@QueryHandler(ListOrdersQuery)
export class ListOrdersHandler implements IQueryHandler<ListOrdersQuery> {
  constructor(private readonly ordersService: OrdersService) {}

  async execute(query: ListOrdersQuery) {
    const orders = await this.ordersService.listOrders({
      tenantId: query.currentUser.tenantId,
      ...query.filters,
    });

    return {
      success: true,
      data: orders,
    };
  }
}

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { OrdersService } from '../../orders.service';
import { GetOrderByIdQuery } from '../impl/get-order-by-id.query';

@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdHandler implements IQueryHandler<GetOrderByIdQuery> {
  constructor(private readonly ordersService: OrdersService) {}

  async execute(query: GetOrderByIdQuery) {
    const order = await this.ordersService.getOrderById({
      id: query.id,
      tenantId: query.currentUser.tenantId,
    });

    return {
      success: true,
      data: order,
    };
  }
}

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListCustomersQuery } from '../impl/list-customers.query';
import { CustomersService } from '../../customers.service';

@QueryHandler(ListCustomersQuery)
export class ListCustomersHandler implements IQueryHandler<ListCustomersQuery> {
  constructor(private readonly customersService: CustomersService) {}

  async execute(query: ListCustomersQuery) {
    const customers = await this.customersService.listCustomers({
      tenantId: query.currentUser.tenantId,
      ...query.filters,
    });

    return {
      success: true,
      data: customers,
    };
  }
}

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListCustomersQuery } from '../impl/list-customers.query';
import { CustomersService } from '../../customers.service';

@QueryHandler(ListCustomersQuery)
export class ListCustomersHandler implements IQueryHandler<ListCustomersQuery> {
  constructor(private readonly customersService: CustomersService) {}

  async execute(query: ListCustomersQuery) {
    const page = query.filters.page ?? 1;
    const pageSize = query.filters.pageSize ?? 10;

    const result = await this.customersService.listCustomers({
      tenantId: query.currentUser.tenantId,
      ...query.filters,
      page,
      pageSize,
    });

    return {
      success: true,
      data: result,
    };
  }
}
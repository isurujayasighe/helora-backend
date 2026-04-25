import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomersService } from '../../customers.service';
import { CustomerLookupQuery } from '../impl/customer-lookup-query';

@QueryHandler(CustomerLookupQuery)
export class CustomerLookupHandler
  implements IQueryHandler<CustomerLookupQuery>
{
  constructor(private readonly customersService: CustomersService) {}

  async execute(query: CustomerLookupQuery) {
    const customers = await this.customersService.lookupCustomers({
      tenantId: query.currentUser.tenantId,
      search: query.filters.search,
      limit: query.filters.limit,
    });

    return {
      success: true,
      data: customers,
    };
  }
}
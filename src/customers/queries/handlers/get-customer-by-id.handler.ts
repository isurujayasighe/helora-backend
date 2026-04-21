import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCustomerByIdQuery } from '../impl/get-customer-by-id.query';
import { CustomersService } from '../../customers.service';

@QueryHandler(GetCustomerByIdQuery)
export class GetCustomerByIdHandler implements IQueryHandler<GetCustomerByIdQuery> {
  constructor(private readonly customersService: CustomersService) {}

  async execute(query: GetCustomerByIdQuery) {
    const customer = await this.customersService.getCustomerById({
      id: query.id,
      tenantId: query.currentUser.tenantId,
    });

    return {
      success: true,
      data: customer,
    };
  }
}

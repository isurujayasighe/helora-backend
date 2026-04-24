import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CustomersService } from '../../customers.service';
import { FindCustomerByPhoneQuery } from '../impl/find-customer-by-phone-query';

@QueryHandler(FindCustomerByPhoneQuery)
export class FindCustomerByPhoneHandler
  implements IQueryHandler<FindCustomerByPhoneQuery>
{
  constructor(private readonly customersService: CustomersService) {}

  async execute(query: FindCustomerByPhoneQuery) {
    const customer = await this.customersService.findByPhoneNumber({
      tenantId: query.currentUser.tenantId,
      phoneNumber: query.phoneNumber,
    });

    return {
      success: true,
      data: customer,
    };
  }
}
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CreateCustomerHandler } from './commands/handlers/create-customer.handler';
import { UpdateCustomerHandler } from './commands/handlers/update-customer.handler';
import { DeleteCustomerHandler } from './commands/handlers/delete-customer.handler';
import { ListCustomersHandler } from './queries/handlers/list-customers.handler';
import { GetCustomerByIdHandler } from './queries/handlers/get-customer-by-id.handler';
import { FindCustomerByPhoneHandler } from './queries/handlers/find-customer-by-handler';

const commandHandlers = [
  CreateCustomerHandler,
  UpdateCustomerHandler,
  DeleteCustomerHandler,
  FindCustomerByPhoneHandler,
];
const queryHandlers = [ListCustomersHandler, GetCustomerByIdHandler];

@Module({
  imports: [CqrsModule],
  controllers: [CustomersController],
  providers: [CustomersService, ...commandHandlers, ...queryHandlers],
  exports: [CustomersService],
})
export class CustomersModule {}

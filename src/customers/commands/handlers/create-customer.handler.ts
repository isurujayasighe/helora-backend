import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCustomerCommand } from '../impl/create-customer.command';
import { CustomersService } from '../../customers.service';

@CommandHandler(CreateCustomerCommand)
export class CreateCustomerHandler implements ICommandHandler<CreateCustomerCommand> {
  constructor(private readonly customersService: CustomersService) {}

  async execute(command: CreateCustomerCommand) {
    const customer = await this.customersService.createCustomer({
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,
      ...command.payload,
    });

    return {
      success: true,
      message: 'Customer created successfully',
      data: customer,
    };
  }
}

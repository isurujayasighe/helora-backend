import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCustomerCommand } from '../impl/update-customer.command';
import { CustomersService } from '../../customers.service';

@CommandHandler(UpdateCustomerCommand)
export class UpdateCustomerHandler implements ICommandHandler<UpdateCustomerCommand> {
  constructor(private readonly customersService: CustomersService) {}

  async execute(command: UpdateCustomerCommand) {
    const customer = await this.customersService.updateCustomer({
      id: command.id,
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.sub,
      ...command.payload,
    });

    return {
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    };
  }
}

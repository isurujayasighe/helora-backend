import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCustomerCommand } from '../impl/delete-customer.command';
import { CustomersService } from '../../customers.service';

@CommandHandler(DeleteCustomerCommand)
export class DeleteCustomerHandler implements ICommandHandler<DeleteCustomerCommand> {
  constructor(private readonly customersService: CustomersService) {}

  async execute(command: DeleteCustomerCommand) {
    await this.customersService.deleteCustomer({
      id: command.id,
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.sub,
    });

    return {
      success: true,
      message: 'Customer deleted successfully',
    };
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrdersService } from '../../orders.service';
import { CreateOrderCommand } from '../impl/create-order.command';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(private readonly ordersService: OrdersService) {}

  async execute(command: CreateOrderCommand) {
    const payload = command.payload;

    const order = await this.ordersService.createOrder({
      tenantId: command.currentUser.tenantId,
      actorUserId: command.currentUser.userId,

      customerId: payload.customerId,
      groupOrderId: payload.groupOrderId ?? undefined,

      orderNumber: payload.orderNumber,
      orderDate: payload.orderDate,
      promisedDate: payload.promisedDate ?? undefined,
      completedAt: payload.completedAt ?? undefined,
      deliveredAt: payload.deliveredAt ?? undefined,

      status: payload.status,
      orderSource: payload.orderSource,
      paymentStatus: payload.paymentStatus,
      paymentMode: payload.paymentMode ?? undefined,

      hospitalName: payload.hospitalName ?? undefined,
      town: payload.town ?? undefined,
      customerAddress: payload.customerAddress ?? undefined,

      totalQty: payload.totalQty,
      totalAmount: payload.totalAmount,
      advanceAmount: payload.advanceAmount,
      balanceAmount: payload.balanceAmount,
      courierCharges: payload.courierCharges,

      notes: payload.notes ?? undefined,
      specialNotes: payload.specialNotes ?? undefined,

      items: payload.items,
    });

    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    };
  }
}
import { Injectable } from "@nestjs/common";

@Injectable()
export class WhatsappTemplateBuilderService {
  buildOrderCreatedTemplateParams(order: any): string[] {
    return [
      order.customer?.fullName ?? "Customer",
      order.orderNo ?? order.id,
      String(order.items?.length ?? 0),
      String(order.totalAmount ?? 0),
    ];
  }

  buildPaymentReceivedTemplateParams(payment: any): string[] {
    return [
      payment.customer?.fullName ?? "Customer",
      payment.order?.orderNo ?? payment.orderId,
      String(payment.paidAmount ?? 0),
      String(payment.paymentCategory ?? "-"),
    ];
  }
}
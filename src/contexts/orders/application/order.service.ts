import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  DOMAIN_EVENT_PUBLISHER,
  type DomainEventPublisher,
} from '../../shared/events/domain-event.publisher';
import { CheckoutService } from '../domain/order/checkout.service';
import { Order } from '../domain/order/order';
import { OrderId } from '../domain/order/order-id';
import type { OrderRepository } from '../domain/order/order.repository';
import { ShippingAddress } from '../domain/order/shipping-address';
import { CartId } from '../domain/shopping-cart/cart-id';
import type { ShoppingCartRepository } from '../domain/shopping-cart/shopping-cart.repository';
import { ORDER_REPOSITORY, SHOPPING_CART_REPOSITORY } from '../orders.tokens';
import { CartIdDto } from './dtos/cart-id.dto';
import { CheckoutDTO } from './dtos/checkout.dto';
import { MarkOrderAsPaidDTO } from './dtos/mark-order-as-paid.dto';
import { OrderIdDto } from './dtos/order-id.dto';
import { OrderResponseDTO } from './dtos/order-response.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject(SHOPPING_CART_REPOSITORY)
    private readonly cartRepository: ShoppingCartRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    private readonly checkoutService: CheckoutService,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async markOrderAsPaid(dto: MarkOrderAsPaidDTO) {
    const orderId = OrderId.fromString(dto.orderId);

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order ${dto.orderId} not found`);
    }

    order.markAsPaid(dto.paymentId);
    await this.orderRepository.save(order);
  }

  async getOrder(orderIdDto: OrderIdDto): Promise<OrderResponseDTO> {
    const orderId = OrderId.fromString(orderIdDto.orderId);
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order ${orderId.getValue()} not found`);
    }

    return this.mapToDto(order);
  }

  async checkoutCart(
    cartIdDto: CartIdDto,
    checkoutDto: CheckoutDTO,
  ): Promise<OrderResponseDTO> {
    const cartId = CartId.fromString(cartIdDto.cartId);
    const cart = await this.cartRepository.findById(cartId);

    if (!cart) {
      throw new NotFoundException(`Cart ${cartId.getValue()} not found`);
    }

    const shippingAddress = new ShippingAddress(checkoutDto.shippingAddress);

    const order = await this.checkoutService.createOrderFromCart(
      cart,
      shippingAddress,
    );

    cart.markAsConverted();

    await this.cartRepository.save(cart);

    await this.eventPublisher.publishDomainEvents([...order.getDomainEvents()]);
    order.clearDomainEvents();

    await this.orderRepository.save(order);

    return this.mapToDto(order);
  }

  private mapToDto(order: Order): OrderResponseDTO {
    return {
      orderId: order.orderId.getValue(),
      cartId: order.cartId.getValue(),
      customerId: order.customerId.getValue(),
      items: order.items.map((item) => ({
        productId: item.productId.getValue(),
        unitPrice: item.unitPrice.amount,
        quantity: item.quantity.getValue(),
        itemDiscount: item.itemDiscount.amount,
        lineTotal: item.getLineTotal().amount,
      })),
      shippingAddress: {
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        stateOrProvince: order.shippingAddress.stateOrProvince,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
      },
      currency: order.globalDiscount.currency,
      globalDiscount: order.globalDiscount.amount,
      totalAmount: order.totalAmount.amount,
      status: order.status.status,
      paymentId: order.paymentId,
    };
  }
}

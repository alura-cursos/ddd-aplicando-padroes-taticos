import { Module } from '@nestjs/common';
import { DOMAIN_EVENT_PUBLISHER } from '../shared/events/domain-event.publisher';
import { CartService } from './application/cart.service';
import { OrderService } from './application/order.service';
import { CheckoutService } from './domain/order/checkout.service';
import { PricingGateway } from './domain/order/pricing.gateway';
import { CartController } from './infrastructure/controllers/cart.controller';
import { OrdersController } from './infrastructure/controllers/orders.controller';
import { InMemoryOrderRepository } from './infrastructure/database/in-memory-order.repository';
import { InMemoryShoppingCartRepository } from './infrastructure/database/in-memory-shopping-cart.repository';
import { OrdersEventPublisher } from './infrastructure/orders-event-publisher';
import { StubPricingGateway } from './infrastructure/stub-pricing.gateway';
import {
  ORDER_REPOSITORY,
  PRICING_GATEWAY,
  SHOPPING_CART_REPOSITORY,
} from './orders.tokens';

@Module({
  controllers: [CartController, OrdersController],
  providers: [
    OrderService,
    CartService,
    {
      provide: SHOPPING_CART_REPOSITORY,
      useClass: InMemoryShoppingCartRepository,
    },
    {
      provide: ORDER_REPOSITORY,
      useClass: InMemoryOrderRepository,
    },
    {
      provide: PRICING_GATEWAY,
      useClass: StubPricingGateway,
    },
    {
      provide: DOMAIN_EVENT_PUBLISHER,
      useClass: OrdersEventPublisher,
    },
    {
      provide: CheckoutService,
      useFactory: (pricingGateway: PricingGateway) => {
        return new CheckoutService(pricingGateway);
      },
      inject: [PRICING_GATEWAY],
    },
  ],
  exports: [OrderService],
})
export class OrdersModule {}

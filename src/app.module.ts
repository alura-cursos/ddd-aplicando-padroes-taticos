import { Module } from '@nestjs/common';
import { OrdersModule } from './contexts/orders/orders.module';
import { PaymentsModule } from './contexts/payments/payments.module';
import { EventsModule } from './contexts/shared/events.module';

@Module({
  imports: [OrdersModule, PaymentsModule, EventsModule],
})
export class AppModule {}

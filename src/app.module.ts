import { Module } from '@nestjs/common';
import { OrdersModule } from './contexts/orders/orders.module';

@Module({
  imports: [OrdersModule],
})
export class AppModule {}

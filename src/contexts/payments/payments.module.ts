import { Module } from '@nestjs/common';
import { PaymentService } from './application/payment.service';
import { PaymentController } from './infrastructure/payments.controller';

@Module({
  imports: [],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentsModule {}

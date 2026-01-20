import { Body, Controller, Post } from '@nestjs/common';

@Controller('payments')
export class PaymentController {
  @Post()
  async processPayment(@Body() dto: any) {}
}

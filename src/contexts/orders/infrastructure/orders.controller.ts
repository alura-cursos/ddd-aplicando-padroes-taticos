import { Controller, Get } from '@nestjs/common';
import { OrdersService } from '../application/orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getHello(): string {
    return this.ordersService.getHello();
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  async processPayment(dto: any): Promise<any> {}
}

import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../application/orders.service';
import { OrdersController } from './orders.controller';

describe('OrdersController', () => {
  let appController: OrdersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [OrdersService],
    }).compile();

    appController = app.get<OrdersController>(OrdersController);
  });

  it('should return "Hello World!"', () => {
    expect(appController.getHello()).toBe('Hello World!');
  });
});

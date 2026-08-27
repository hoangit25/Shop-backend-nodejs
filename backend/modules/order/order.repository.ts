import { BaseRepository } from '../../common/base.repository';
import { OrderModel, IOrder, OrderStatus } from './order.model';

export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super(OrderModel);
  }

  async findByCustomer(customerId: string) {
    return this.find({ customer: customerId, deleted: false });
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    return this.updateById(orderId, { status });
  }
}

export const orderRepository = new OrderRepository();

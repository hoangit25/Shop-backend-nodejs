import { BaseRepository } from '../../../common/base.repository';
import {
  InventoryTransactionModel,
  IInventoryTransaction,
} from '../models/inventory-transaction.model';

export class InventoryTransactionRepository extends BaseRepository<IInventoryTransaction> {
  constructor() {
    super(InventoryTransactionModel);
  }

  async findByVariant(variantId: string) {
    return this.find({ variant: variantId }, undefined, {
      sort: { createdAt: -1 },
    });
  }

  async findByInventory(inventoryId: string) {
    return this.find({ inventory: inventoryId }, undefined, {
      sort: { createdAt: -1 },
    });
  }
}

export const inventoryTransactionRepository =
  new InventoryTransactionRepository();

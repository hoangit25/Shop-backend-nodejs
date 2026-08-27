import { BaseRepository } from '../../../common/base.repository';
import { InventoryModel, IInventory } from '../models/inventory.model';

export class InventoryRepository extends BaseRepository<IInventory> {
  constructor() {
    super(InventoryModel);
  }

  async findByVariant(variantId: string) {
    return this.findOne({
      variant: variantId,
      deleted: false,
    });
  }

  async findByVariants(variantIds: string[]) {
    return this.find({
      variant: { $in: variantIds },
      deleted: false,
    });
  }

  async increaseOnHand(variantId: string, quantity: number, session?: any) {
    return InventoryModel.findOneAndUpdate(
      { variant: variantId, deleted: false },
      { $inc: { onHand: quantity } },
      { new: true, session }
    );
  }

  async decreaseOnHand(variantId: string, quantity: number, session?: any) {
    return InventoryModel.findOneAndUpdate(
      {
        variant: variantId,
        deleted: false,
        onHand: { $gte: quantity },
      },
      { $inc: { onHand: -quantity } },
      { new: true, session }
    );
  }

  async reserve(variantId: string, quantity: number, session?: any) {
    return InventoryModel.findOneAndUpdate(
      {
        variant: variantId,
        deleted: false,
        $expr: {
          $gte: [{ $subtract: ['$onHand', '$reserved'] }, quantity],
        },
      },
      { $inc: { reserved: quantity } },
      { new: true, session }
    );
  }

  async release(variantId: string, quantity: number, session?: any) {
    return InventoryModel.findOneAndUpdate(
      {
        variant: variantId,
        deleted: false,
        reserved: { $gte: quantity },
      },
      { $inc: { reserved: -quantity } },
      { new: true, session }
    );
  }

  async updateInventory(variantId: string, update: any, session?: any) {
    return InventoryModel.findOneAndUpdate(
      { variant: variantId, deleted: false },
      update,
      { new: true, runValidators: true, session }
    );
  }

  async findLowStock(limit = 50) {
    return this.find(
      {
        deleted: false,
        $expr: {
          $lte: [{ $subtract: ['$onHand', '$reserved'] }, '$lowStockThreshold'],
        },
      },
      undefined,
      { limit }
    );
  }
}

export const inventoryRepository = new InventoryRepository();

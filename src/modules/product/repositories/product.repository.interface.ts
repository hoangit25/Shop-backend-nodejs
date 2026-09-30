import { IProduct, ProductStatus } from '../models/product.model';

export interface IProductRepository {
  findBySlug(slug: string): Promise<IProduct | null>;
  findWithDetails(id: string): Promise<IProduct | null>;
  findPublished(filter?: any): Promise<IProduct[]>;
  findByStore(storeId: string): Promise<IProduct[]>;
  findDraftByStore(storeId: string): Promise<IProduct[]>;
  findPending(): Promise<IProduct[]>;
  publish(productId: string, approvedBy: string, session?: any): Promise<IProduct | null>;
  reject(productId: string, approvedBy: string, reason: string, session?: any): Promise<IProduct | null>;
  archive(productId: string, session?: any): Promise<IProduct | null>;
  create(data: Partial<IProduct>, options?: any): Promise<IProduct>;
  findById(id: string, projection?: any, options?: any): Promise<IProduct | null>;
  findOne(filter: any, projection?: any, options?: any): Promise<IProduct | null>;
  find(filter: any, projection?: any, options?: any): Promise<IProduct[]>;
  exists(filter: any): Promise<any>;
  count(filter: any): Promise<number>;
  updateById(id: string, update: any, options?: any): Promise<IProduct | null>;
  softDelete(id: string, options?: any): Promise<IProduct | null>;
  restore(id: string, options?: any): Promise<IProduct | null>;
}

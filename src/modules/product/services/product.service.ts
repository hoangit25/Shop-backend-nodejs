import mongoose, { Types } from 'mongoose';
import { AppError } from '../../../common/AppError';
import { BrandModel } from '../../brand/brand.model';
import { CategoryModel } from '../../category/category.model';
import { MediaOwnerType } from '../../media/media.model';
import { StoreModel } from '../../store/store.model';
import { productRepository, ProductRepository } from '../repositories/product.repository';
import { inventoryRepository } from '../repositories/inventory.repository';
import { mediaRepository } from '../repositories/media.repository';
import { productVariantRepository } from '../repositories/product-variant.repository';
import { inventoryTransactionRepository } from '../repositories/inventory-transaction.repository';
import { InventoryTransactionType } from '../models/inventory-transaction.model';
import { ProductStatus } from '../models/product.model';
import { ProductVariantStatus } from '../models/product-variant.model';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  AdjustStockDto,
  VariantDto,
  AddVariantDto,
  UpdateVariantDto,
} from '../Dto';

export class ProductService {
  constructor(private productRepo: ProductRepository = productRepository) {}

  async create(payload: CreateProductDto, createdBy?: string) {
    const slug = payload.slug?.trim().toLowerCase();
    if (!slug) {
      throw new AppError(400, 'Slug is required.');
    }

    const exists = await this.productRepo.exists({
      slug,
      deleted: false,
    });
    if (exists) {
      throw new AppError(409, 'Product slug already exists.');
    }

    await this.ensureRelatedEntities(payload.storeId, payload.categoryId, payload.brandId);

    const session = await mongoose.startSession();
    let createdProductId = '';

    try {
      await session.withTransaction(async () => {
        const productArray = await this.productRepo.create(
          {
            store: new Types.ObjectId(payload.storeId),
            category: new Types.ObjectId(payload.categoryId),
            brand: payload.brandId ? new Types.ObjectId(payload.brandId) : null,
            name: payload.name,
            slug,
            shortDescription: payload.shortDescription ?? '',
            description: payload.description ?? '',
            seo: payload.seo ?? {},
            tags: payload.tags ?? [],
            weight: payload.weight ?? 0,
            hasVariants: payload.hasVariants ?? false,
            status: payload.status ? (payload.status as ProductStatus) : ProductStatus.DRAFT,
            isActive: payload.isActive ?? true,
            createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
          },
          { session }
        );

        const product = Array.isArray(productArray) ? productArray[0] : productArray;
        createdProductId = (product as any)._id.toString();

        if (payload.medias?.length) {
          await this.createProductMedias(createdProductId, payload.medias, createdBy, session);
        }

        if (payload.hasVariants && payload.variants?.length) {
          await this.createProductVariants(createdProductId, payload.variants, createdBy, session);
        }
      });
    } finally {
      await session.endSession();
    }

    return this.getById(createdProductId);
  }

  async getAll(queryDto: ProductQueryDto = {}) {
    const safePage = Math.max(1, Number(queryDto.page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(queryDto.limit) || 20));
    const {
      search,
      status,
      storeId,
      categoryId,
      brandId,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const filter: any = {
      deleted: false,
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      filter.status = status;
    }
    if (storeId) {
      filter.store = storeId;
    }
    if (categoryId) {
      filter.category = categoryId;
    }
    if (brandId) {
      filter.brand = brandId;
    }
    if (isActive !== undefined) {
      filter.isActive = String(isActive) === 'true';
    }

    const [rawItems, total] = await Promise.all([
      this.productRepo.find(filter, undefined, {
        sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
        skip: (safePage - 1) * safeLimit,
        limit: safeLimit,
      }),
      this.productRepo.count(filter),
    ]);

    const items = await Promise.all(
      rawItems.map(async (item: any) => {
        const [variants, medias] = await Promise.all([
          productVariantRepository.findByProduct(item._id.toString()),
          mediaRepository.findByOwner(MediaOwnerType.PRODUCT, item._id.toString()),
        ]);

        const variantsWithStock = await Promise.all(
          variants.map(async (v: any) => {
            const inv = await inventoryRepository.findByVariant(v._id.toString());
            return {
              ...v.toObject(),
              inventory: inv ? inv.toObject() : null,
            };
          })
        );

        return {
          ...item.toObject(),
          variants: variantsWithStock,
          medias,
        };
      })
    );

    return {
      items,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getPublished(queryDto: ProductQueryDto = {}) {
    return this.getAll({
      ...queryDto,
      status: ProductStatus.PUBLISHED,
      isActive: 'true',
    });
  }

  async getById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'Invalid Product ID.');
    }

    const product = await this.productRepo.findWithDetails(id);
    if (!product) {
      throw new AppError(404, 'Product not found.');
    }

    const [variants, medias] = await Promise.all([
      productVariantRepository.findByProduct(id),
      mediaRepository.findByOwner(MediaOwnerType.PRODUCT, id),
    ]);

    const variantsWithInventory = await Promise.all(
      variants.map(async (variant: any) => {
        const inventory = await inventoryRepository.findByVariant(variant._id.toString());
        return {
          ...variant.toObject(),
          inventory: inventory ? inventory.toObject() : null,
        };
      })
    );

    return {
      ...product.toObject(),
      variants: variantsWithInventory,
      medias,
    };
  }

  async getBySlug(slug: string) {
    const product = await this.productRepo.findBySlug(slug);
    if (!product) {
      throw new AppError(404, 'Product not found.');
    }
    return this.getById((product as any)._id.toString());
  }

  async update(id: string, payload: UpdateProductDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'Invalid Product ID.');
    }

    const product = await this.productRepo.findOne({
      _id: id,
      deleted: false,
    });
    if (!product) {
      throw new AppError(404, 'Product not found.');
    }

    if (payload.slug && payload.slug !== (product as any).slug) {
      const exists = await this.productRepo.exists({
        slug: payload.slug.toLowerCase(),
        deleted: false,
        _id: { $ne: id },
      });
      if (exists) {
        throw new AppError(409, 'Product slug already exists.');
      }
    }

    if (payload.storeId || payload.categoryId || payload.brandId) {
      await this.ensureRelatedEntities(
        payload.storeId ?? (product as any).store?.toString(),
        payload.categoryId ?? (product as any).category?.toString(),
        payload.brandId ?? (product as any).brand?.toString()
      );
    }

    const updateData: any = {};
    if (payload.storeId) updateData.store = new Types.ObjectId(payload.storeId);
    if (payload.categoryId) updateData.category = new Types.ObjectId(payload.categoryId);
    if (payload.brandId !== undefined) {
      updateData.brand = payload.brandId ? new Types.ObjectId(payload.brandId) : null;
    }
    if (payload.name) updateData.name = payload.name;
    if (payload.slug) updateData.slug = payload.slug.toLowerCase();
    if (payload.shortDescription !== undefined) updateData.shortDescription = payload.shortDescription;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.seo !== undefined) {
      updateData.seo = {
        title: payload.seo.title ?? null,
        description: payload.seo.description ?? null,
        keywords: payload.seo.keywords ?? [],
      };
    }
    if (payload.tags !== undefined) updateData.tags = payload.tags;
    if (payload.weight !== undefined) updateData.weight = payload.weight;
    if (payload.hasVariants !== undefined) updateData.hasVariants = payload.hasVariants;
    if (payload.status) updateData.status = payload.status;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.productRepo.updateById(id, updateData);
    return this.getById(id);
  }

  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'Invalid Product ID.');
    }

    const product = await this.productRepo.findOne({
      _id: id,
      deleted: false,
    });
    if (!product) {
      throw new AppError(404, 'Product not found.');
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await this.productRepo.softDelete(id, { session });
        await productVariantRepository.softDeleteByProduct(id, session);
        await mediaRepository.softDeleteByOwner(MediaOwnerType.PRODUCT, id, session);
      });
    } finally {
      await session.endSession();
    }
  }

  async restore(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'Invalid Product ID.');
    }

    const product = await this.productRepo.findOne({
      _id: id,
      deleted: true,
    });
    if (!product) {
      throw new AppError(404, 'Deleted product not found.');
    }

    await this.productRepo.updateById(id, {
      deleted: false,
      isActive: true,
    });

    return this.getById(id);
  }

  async publish(id: string, approvedBy?: string) {
    const product = await this.productRepo.findOne({ _id: id, deleted: false });
    if (!product) {
      throw new AppError(404, 'Product not found.');
    }
    if ((product as any).status === ProductStatus.PUBLISHED) {
      return this.getById(id);
    }
    await this.productRepo.publish(id, approvedBy || '');
    return this.getById(id);
  }

  async reject(id: string, approvedBy: string, reason: string) {
    const product = await this.productRepo.findOne({ _id: id, deleted: false });
    if (!product) {
      throw new AppError(404, 'Product not found.');
    }
    await this.productRepo.reject(id, approvedBy, reason);
    return this.getById(id);
  }

  async archive(id: string) {
    const product = await this.productRepo.findOne({ _id: id, deleted: false });
    if (!product) {
      throw new AppError(404, 'Product not found.');
    }
    await this.productRepo.archive(id);
    return this.getById(id);
  }

  async addVariant(productId: string, payload: AddVariantDto | VariantDto | any, createdBy?: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new AppError(400, 'Invalid Product ID.');
    }

    const product = await this.productRepo.findOne({ _id: productId, deleted: false });
    if (!product) {
      throw new AppError(404, 'Product not found.');
    }

    const skuExists = await productVariantRepository.existsSku(payload.sku);
    if (skuExists) {
      throw new AppError(409, `SKU '${payload.sku}' already exists.`);
    }

    const session = await mongoose.startSession();
    let newVariantId = '';

    try {
      await session.withTransaction(async () => {
        const createdVariantArray = await productVariantRepository.create(
          {
            product: productId as any,
            sku: payload.sku.toUpperCase(),
            barcode: payload.barcode ?? null,
            price: payload.price,
            compareAtPrice: payload.compareAtPrice ?? null,
            costPrice: payload.costPrice ?? null,
            weight: payload.weight ?? 0,
            length: payload.length ?? 0,
            width: payload.width ?? 0,
            height: payload.height ?? 0,
            options: payload.options ?? [],
            isDefault: payload.isDefault ?? false,
            status: ProductVariantStatus.ACTIVE,
          },
          { session }
        );

        const createdVariant = Array.isArray(createdVariantArray)
          ? createdVariantArray[0]
          : createdVariantArray;
        newVariantId = (createdVariant as any)._id.toString();

        const inventoryArray = await inventoryRepository.create(
          {
            variant: (createdVariant as any)._id,
            onHand: payload.quantity ?? 0,
            reserved: 0,
            incoming: 0,
            damaged: 0,
            lowStockThreshold: 5,
            allowBackorder: false,
          },
          { session }
        );

        const inventory = Array.isArray(inventoryArray) ? inventoryArray[0] : inventoryArray;

        await inventoryTransactionRepository.create(
          {
            inventory: (inventory as any)._id,
            variant: (createdVariant as any)._id,
            type: InventoryTransactionType.ADJUSTMENT,
            quantity: payload.quantity ?? 0,
            balanceAfter: payload.quantity ?? 0,
            note: 'Variant created',
            createdBy: createdBy ? new Types.ObjectId(createdBy) : null,
          },
          { session }
        );

        if (!(product as any).hasVariants) {
          await this.productRepo.updateById(productId, { hasVariants: true }, { session });
        }
      });
    } finally {
      await session.endSession();
    }

    return productVariantRepository.findById(newVariantId);
  }

  async updateVariant(variantId: string, payload: UpdateVariantDto) {
    if (!Types.ObjectId.isValid(variantId)) {
      throw new AppError(400, 'Invalid Variant ID.');
    }

    const variant = await productVariantRepository.findOne({ _id: variantId, deleted: false });
    if (!variant) {
      throw new AppError(404, 'Variant not found.');
    }

    if (payload.sku && payload.sku.toUpperCase() !== (variant as any).sku) {
      const exists = await productVariantRepository.existsSku(payload.sku, variantId);
      if (exists) {
        throw new AppError(409, `SKU '${payload.sku}' already exists.`);
      }
    }

    const updateData: any = {};
    if (payload.sku) updateData.sku = payload.sku.toUpperCase();
    if (payload.barcode !== undefined) updateData.barcode = payload.barcode;
    if (payload.price !== undefined) updateData.price = payload.price;
    if (payload.compareAtPrice !== undefined) updateData.compareAtPrice = payload.compareAtPrice;
    if (payload.costPrice !== undefined) updateData.costPrice = payload.costPrice;
    if (payload.weight !== undefined) updateData.weight = payload.weight;
    if (payload.length !== undefined) updateData.length = payload.length;
    if (payload.width !== undefined) updateData.width = payload.width;
    if (payload.height !== undefined) updateData.height = payload.height;
    if (payload.status) updateData.status = payload.status;
    if (payload.options) updateData.options = payload.options;

    if (payload.isDefault) {
      await productVariantRepository.setDefaultVariant((variant as any).product.toString(), variantId);
    }

    return productVariantRepository.updateById(variantId, updateData);
  }

  async deleteVariant(variantId: string) {
    if (!Types.ObjectId.isValid(variantId)) {
      throw new AppError(400, 'Invalid Variant ID.');
    }

    const variant = await productVariantRepository.findOne({ _id: variantId, deleted: false });
    if (!variant) {
      throw new AppError(404, 'Variant not found.');
    }

    return productVariantRepository.softDelete(variantId);
  }

  async adjustStock(variantId: string, payload: AdjustStockDto, createdBy?: string) {
    if (!Types.ObjectId.isValid(variantId)) {
      throw new AppError(400, 'Invalid Variant ID.');
    }

    const inventory = await inventoryRepository.findByVariant(variantId);
    if (!inventory) {
      throw new AppError(404, 'Inventory not found for this variant.');
    }

    const adjustmentQty = Number(payload.quantity || 0);
    if (!Number.isFinite(adjustmentQty)) {
      throw new AppError(400, 'Quantity must be a valid number.');
    }

    let transactionType = InventoryTransactionType.ADJUSTMENT;
    if (payload.type && Object.values(InventoryTransactionType).includes(payload.type as any)) {
      transactionType = payload.type as unknown as InventoryTransactionType;
    }

    let newOnHand = (inventory as any).onHand;
    if (payload.type === 'decrease') {
      newOnHand = Math.max(0, (inventory as any).onHand - Math.abs(adjustmentQty));
    } else if (payload.type === 'increase') {
      newOnHand = (inventory as any).onHand + Math.abs(adjustmentQty);
    } else {
      newOnHand = Math.max(0, (inventory as any).onHand + adjustmentQty);
    }

    const effectiveChange = newOnHand - (inventory as any).onHand;

    const session = await mongoose.startSession();
    let updatedInventory = null;

    try {
      await session.withTransaction(async () => {
        updatedInventory = await inventoryRepository.updateInventory(
          variantId,
          { onHand: newOnHand },
          session
        );

        await inventoryTransactionRepository.create(
          {
            inventory: (inventory as any)._id,
            variant: new Types.ObjectId(variantId),
            type: transactionType,
            quantity: effectiveChange,
            balanceAfter: newOnHand,
            note: payload.note || 'Stock adjusted',
            referenceType: payload.referenceType || null,
            referenceId: payload.referenceId ? new Types.ObjectId(payload.referenceId) : null,
            createdBy: createdBy ? new Types.ObjectId(createdBy) : null,
          },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    return updatedInventory;
  }

  async getStockHistory(variantId: string) {
    if (!Types.ObjectId.isValid(variantId)) {
      throw new AppError(400, 'Invalid Variant ID.');
    }
    return inventoryTransactionRepository.findByVariant(variantId);
  }

  async getLowStock(limit = 50) {
    return inventoryRepository.findLowStock(limit);
  }

  private async ensureRelatedEntities(storeId?: string, categoryId?: string, brandId?: string) {
    if (storeId) {
      if (!Types.ObjectId.isValid(storeId)) {
        throw new AppError(400, 'Invalid Store ID.');
      }
      const store = await StoreModel.findOne({
        _id: storeId,
        deleted: false,
        isActive: true,
      });
      if (!store) {
        throw new AppError(404, 'Store not found.');
      }
    }

    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new AppError(400, 'Invalid Category ID.');
      }
      const category = await CategoryModel.findOne({
        _id: categoryId,
        deleted: false,
        isActive: true,
      });
      if (!category) {
        throw new AppError(404, 'Category not found.');
      }
    }

    if (brandId) {
      if (!Types.ObjectId.isValid(brandId)) {
        throw new AppError(400, 'Invalid Brand ID.');
      }
      const brand = await BrandModel.findOne({
        _id: brandId,
        deleted: false,
        isActive: true,
      });
      if (!brand) {
        throw new AppError(404, 'Brand not found.');
      }
    }
  }

  private async createProductVariants(
    productId: string,
    variants: any[],
    createdBy?: string,
    session?: any
  ) {
    const createdVariants: any[] = [];
    for (const variant of variants) {
      const skuExists = await productVariantRepository.existsSku(variant.sku);
      if (skuExists) {
        throw new AppError(409, `SKU '${variant.sku}' already exists.`);
      }

      const createdVariantArray = await productVariantRepository.create(
        {
          product: productId as any,
          sku: variant.sku.toUpperCase(),
          barcode: variant.barcode ?? null,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice ?? null,
          costPrice: variant.costPrice ?? null,
          weight: variant.weight ?? 0,
          length: variant.length ?? 0,
          width: variant.width ?? 0,
          height: variant.height ?? 0,
          options: variant.options ?? [],
          isDefault: variant.isDefault ?? false,
          status: ProductVariantStatus.ACTIVE,
        },
        { session }
      );

      const createdVariant = Array.isArray(createdVariantArray)
        ? createdVariantArray[0]
        : createdVariantArray;

      const inventoryArray = await inventoryRepository.create(
        {
          variant: (createdVariant as any)._id,
          onHand: variant.quantity ?? 0,
          reserved: 0,
          incoming: 0,
          damaged: 0,
          lowStockThreshold: 5,
          allowBackorder: false,
        },
        { session }
      );

      const inventory = Array.isArray(inventoryArray) ? inventoryArray[0] : inventoryArray;

      await inventoryTransactionRepository.create(
        {
          inventory: (inventory as any)._id,
          variant: (createdVariant as any)._id,
          type: InventoryTransactionType.ADJUSTMENT,
          quantity: variant.quantity ?? 0,
          balanceAfter: variant.quantity ?? 0,
          note: 'Initial stock created',
          createdBy: createdBy ? new Types.ObjectId(createdBy) : null,
        },
        { session }
      );

      createdVariants.push(createdVariant);
    }

    if (createdVariants.length > 0 && !createdVariants.some((v) => v.isDefault)) {
      await productVariantRepository.updateById(
        (createdVariants[0] as any)._id.toString(),
        { isDefault: true },
        { session }
      );
    }
  }

  private async createProductMedias(
    productId: string,
    medias: any[],
    createdBy?: string,
    session?: any
  ) {
    await Promise.all(
      medias.map((media) =>
        mediaRepository.create(
          {
            ownerType: MediaOwnerType.PRODUCT,
            ownerId: productId as any,
            url: media.url,
            thumbnailUrl: media.thumbnailUrl ?? null,
            alt: media.alt ?? '',
            isPrimary: media.isPrimary ?? false,
            sortOrder: media.sortOrder ?? 0,
            createdBy: createdBy ? new Types.ObjectId(createdBy) : null,
          },
          { session }
        )
      )
    );
  }
}

export const productService = new ProductService();

import { Express } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { roleRouter } from '../modules/role/role.routes';
import productRoutes from '../modules/product/routes/product.routes';
import productOptionRoutes from '../modules/product/routes/product-option.routes';
import userRoutes from '../modules/user/user.routes';
import orderRoutes from '../modules/order/order.routes';
import voucherRoutes from '../modules/voucher/voucher.routes';
import reviewRoutes from '../modules/review/review.routes';
import brandRoutes from '../modules/brand/brand.routes';
import categoryRoutes from '../modules/category/category.routes';
import storeRoutes from '../modules/store/store.routes';
import mediaRoutes from '../modules/media/media.routes';
import permissionRoutes from '../modules/permission/permission.routes';
import { errorHandler } from '../middlewares/AppError.middleware';

export const indexRouter = (app: Express) => {
  const version = '/api/v1';

  app.use(`${version}/auth`, authRouter);
  app.use(`${version}/users`, userRoutes);
  app.use(`${version}/roles`, roleRouter);
  app.use(`${version}/permissions`, permissionRoutes);
  app.use(`${version}/products`, productRoutes);
  app.use(`${version}/product-options`, productOptionRoutes);
  app.use(`${version}/categories`, categoryRoutes);
  app.use(`${version}/brands`, brandRoutes);
  app.use(`${version}/stores`, storeRoutes);
  app.use(`${version}/orders`, orderRoutes);
  app.use(`${version}/vouchers`, voucherRoutes);
  app.use(`${version}/reviews`, reviewRoutes);
  app.use(`${version}/media`, mediaRoutes);

  app.use(errorHandler);
};


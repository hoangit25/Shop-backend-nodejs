export enum PermissionModule {
  DASHBOARD = 'dashboard',
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  STORE = 'store',
  PRODUCT = 'product',
  CATEGORY = 'category',
  ORDER = 'order',
  REVIEW = 'review',
  VOUCHER = 'voucher',
  AUTH = 'auth',
  BRAND = 'brand',
}

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',

  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_REFRESH_TOKEN: 'auth:refresh-token',

  USER_CREATE: 'user:create',
  USER_VIEW: 'user:view',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_BLOCK: 'user:block',

  ROLE_CREATE: 'role:create',
  ROLE_VIEW: 'role:view',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',

  PERMISSION_CREATE: 'permission:create',
  PERMISSION_VIEW: 'permission:view',
  PERMISSION_UPDATE: 'permission:update',
  PERMISSION_DELETE: 'permission:delete',

  STORE_CREATE: 'store:create',
  STORE_VIEW: 'store:view',
  STORE_UPDATE: 'store:update',
  STORE_DELETE: 'store:delete',

  PRODUCT_CREATE: 'product:create',
  PRODUCT_VIEW: 'product:view',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',
  PRODUCT_UPDATE_PRICE: 'product:update-price',
  PRODUCT_UPDATE_STOCK: 'product:update-stock',
  PRODUCT_UPDATE_STATUS: 'product:update-status',

  CATEGORY_CREATE: 'category:create',
  CATEGORY_VIEW: 'category:view',
  CATEGORY_UPDATE: 'category:update',
  CATEGORY_DELETE: 'category:delete',

  ORDER_VIEW: 'order:view',
  ORDER_CREATE: 'order:create',
  ORDER_UPDATE: 'order:update',
  ORDER_CANCEL: 'order:cancel',
  ORDER_CONFIRM: 'order:confirm',
  ORDER_SHIPPING: 'order:shipping',
  ORDER_COMPLETE: 'order:complete',

  REVIEW_CREATE: 'review:create',
  REVIEW_VIEW: 'review:view',
  REVIEW_UPDATE: 'review:update',
  REVIEW_DELETE: 'review:delete',

  VOUCHER_CREATE: 'voucher:create',
  VOUCHER_VIEW: 'voucher:view',
  VOUCHER_UPDATE: 'voucher:update',
  VOUCHER_DELETE: 'voucher:delete',

  BRAND_CREATE: 'brand:create',
  BRAND_VIEW: 'brand:view',
  BRAND_UPDATE: 'brand:update',
  BRAND_DELETE: 'brand:delete',
} as const;

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const PERMISSION_GROUPS: Record<string, string[]> = {
  [PermissionModule.DASHBOARD]: [
    PERMISSIONS.DASHBOARD_VIEW,
  ],
  [PermissionModule.AUTH]: [
    PERMISSIONS.AUTH_LOGIN,
    PERMISSIONS.AUTH_LOGOUT,
    PERMISSIONS.AUTH_REFRESH_TOKEN,
  ],
  [PermissionModule.USER]: [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_BLOCK,
  ],
  [PermissionModule.ROLE]: [
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.ROLE_UPDATE,
    PERMISSIONS.ROLE_DELETE,
  ],
  [PermissionModule.PERMISSION]: [
    PERMISSIONS.PERMISSION_CREATE,
    PERMISSIONS.PERMISSION_VIEW,
    PERMISSIONS.PERMISSION_UPDATE,
    PERMISSIONS.PERMISSION_DELETE,
  ],
  [PermissionModule.STORE]: [
    PERMISSIONS.STORE_CREATE,
    PERMISSIONS.STORE_VIEW,
    PERMISSIONS.STORE_UPDATE,
    PERMISSIONS.STORE_DELETE,
  ],
  [PermissionModule.PRODUCT]: [
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.PRODUCT_UPDATE_PRICE,
    PERMISSIONS.PRODUCT_UPDATE_STOCK,
    PERMISSIONS.PRODUCT_UPDATE_STATUS,
  ],
  [PermissionModule.CATEGORY]: [
    PERMISSIONS.CATEGORY_CREATE,
    PERMISSIONS.CATEGORY_VIEW,
    PERMISSIONS.CATEGORY_UPDATE,
    PERMISSIONS.CATEGORY_DELETE,
  ],
  [PermissionModule.ORDER]: [
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.ORDER_CANCEL,
    PERMISSIONS.ORDER_CONFIRM,
    PERMISSIONS.ORDER_SHIPPING,
    PERMISSIONS.ORDER_COMPLETE,
  ],
  [PermissionModule.REVIEW]: [
    PERMISSIONS.REVIEW_CREATE,
    PERMISSIONS.REVIEW_VIEW,
    PERMISSIONS.REVIEW_UPDATE,
    PERMISSIONS.REVIEW_DELETE,
  ],
  [PermissionModule.VOUCHER]: [
    PERMISSIONS.VOUCHER_CREATE,
    PERMISSIONS.VOUCHER_VIEW,
    PERMISSIONS.VOUCHER_UPDATE,
    PERMISSIONS.VOUCHER_DELETE,
  ],
  [PermissionModule.BRAND]: [
    PERMISSIONS.BRAND_CREATE,
    PERMISSIONS.BRAND_VIEW,
    PERMISSIONS.BRAND_DELETE,
    PERMISSIONS.BRAND_UPDATE,
  ],
};

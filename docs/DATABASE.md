# 🗄️ Database Documentation

Tài liệu thiết kế cơ sở dữ liệu MongoDB, Mongoose Models, Indexes và Chiến lược Seeding.

---

## 1. Danh Sách Mongoose Models

Hệ thống sử dụng MongoDB làm cơ sở dữ liệu chính với 15 Collections:

| Collection Name | Model | Thư Mục Domain | Mô Tả |
|---|---|---|---|
| `Users` | `UserModel` | `modules/user/` | Lưu thông tin người dùng, tài khoản, và quyền ghi đè |
| `Roles` | `RoleModel` | `modules/role/` | Lưu thông tin vai trò (`SYSTEM` hoặc `STORE`) và mảng permissions |
| `Permissions` | `PermissionModel` | `modules/permission/` | Danh sách mã quyền hệ thống |
| `Sessions` | `SessionModel` | `modules/auth/models/` | Lưu phiên đăng nhập đa thiết bị (TTL Index) |
| `BlacklistedTokens` | `BlacklistedTokenModel` | `modules/auth/models/` | Lưu các JTI token bị thu hồi khi Logout (TTL Index) |
| `AuditLogs` | `AuditLogModel` | `modules/auth/models/` | Lưu nhật ký sự kiện an ninh bảo mật |
| `Stores` | `StoreModel` | `modules/store/` | Thông tin cửa hàng, nhân viên cửa hàng |
| `Products` | `ProductModel` | `modules/product/models/` | Thông tin sản phẩm chính |
| `ProductVariants` | `ProductVariantModel` | `modules/product/models/` | Biến thể sản phẩm (Giá, Màu sắc, Kích thước, SKU) |
| `ProductOptions` | `ProductOptionModel` | `modules/product/models/` | Tùy chọn thuộc tính sản phẩm |
| `Inventories` | `InventoryModel` | `modules/product/models/` | Tồn kho thực tế (`quantity`), khả dụng (`available`), giữ chỗ (`reserved`) |
| `InventoryTransactions` | `InventoryTransactionModel` | `modules/product/models/` | Lịch sử nhập/xuất/giữ chỗ kho |
| `Categories` | `CategoryModel` | `modules/category/` | Danh mục sản phẩm (Hỗ trợ cha - con `parent`) |
| `Brands` | `BrandModel` | `modules/brand/` | Thương hiệu sản phẩm |
| `Orders` | `OrderModel` | `modules/order/` | Thông tin đơn hàng & trạng thái thanh toán |
| `Vouchers` | `VoucherModel` | `modules/voucher/` | Mã giảm giá & hạn mức |
| `Reviews` | `ReviewModel` | `modules/review/` | Đánh giá & bình luận sản phẩm |
| `Media` | `MediaModel` | `modules/media/` | Quản lý hình ảnh/video tải lên Cloudinary |

---

## 2. Chiến Lược Indexes (Indexing Strategy)

Tất cả các Collections đều được tối ưu hóa chỉ mục để đạt hiệu năng truy vấn cao nhất:

### TTL Indexes (Tự động xoá dữ liệu hết hạn)
1. **`Sessions`**:
   - `expiresAt`: TTL Index (`expireAfterSeconds: 0`). MongoDB tự động xóa các session đã hết hạn mà không cần chạy cronjob background.
2. **`BlacklistedTokens`**:
   - `expiresAt`: TTL Index (`expireAfterSeconds: 0`). Tự động dọn dẹp các token bị thu hồi sau khi thời gian sống gốc của JWT trôi qua.

### Single & Compound Indexes
- **`Users`**: `email` (`unique`), Compound Index `{ deleted: 1, isActive: 1 }`.
- **`Categories`**: `slug` (`unique`), Compound Indexes `{ parent: 1, sortOrder: 1 }` và `{ deleted: 1, isActive: 1 }`.
- **`Products`**: `slug` (`unique`), Compound Index `{ storeId: 1, status: 1, deleted: 1 }`.
- **`Media`**: Compound Indexes `{ ownerType: 1, ownerId: 1 }`, `{ ownerType: 1, ownerId: 1, isPrimary: 1 }`.

---

## 3. Quản Lý Dữ Liệu Ban Đầu (Seeding Strategy)

Dự án có cơ chế Seed tự động chạy bằng lệnh:
```bash
npm run seed
```

### Luồng Hoạt Động của Seeder (`backend/database/seed.ts`):
1. **`seedPermissions()`**: Quét danh sách mã quyền trong `constants/permissions.ts` và ghi vào collection `Permissions` (dùng `upsert: true` để tránh trùng lặp).
2. **`seedRoles()`**: Lấy tất cả `Permission` IDs và tạo Role **Super Admin** (`slug: 'super-admin'`) nắm giữ toàn bộ hệ thống.

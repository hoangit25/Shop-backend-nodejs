# 📑 API Reference Documentation

Tài liệu hướng dẫn và danh sách chi tiết tất cả các RESTful API Endpoints (`/api/v1`).

---

## 🌐 Quy Chuẩn REST API

### Base URL
```text
http://localhost:5000/api/v1
```

### Response Format Chuẩn
```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response Format Chuẩn
```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 🔑 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Bảo Mật | Mô Tả |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Đăng ký tài khoản người dùng mới |
| `POST` | `/auth/login` | Public | Đăng nhập & trả về cặp Token (`accessToken`, `refreshToken`) |
| `POST` | `/auth/refresh` | Public | Đổi `refreshToken` lấy `accessToken` mới |
| `POST` | `/auth/logout` | Bearer Token | Đăng xuất & cho AccessToken hiện tại vào Blacklist |
| `GET` | `/auth/sessions` | Bearer Token | Xem danh sách tất cả các session/thiết bị đang đăng nhập |
| `DELETE` | `/auth/sessions/other` | Bearer Token | Đăng xuất khỏi tất cả các thiết bị khác |
| `DELETE` | `/auth/sessions/:sessionId` | Bearer Token | Đăng xuất khỏi 1 session cụ thể |

---

## 👤 2. User Management (`/api/v1/users`)

| Method | Endpoint | Bảo Mật | Mô Tả |
|---|---|---|---|
| `GET` | `/users/me` | Bearer Token | Lấy thông tin cá nhân hiện tại |
| `PUT` | `/users/me` | Bearer Token | Cập nhật thông tin cá nhân (họ tên, số điện thoại, avatar) |
| `PUT` | `/users/me/password` | Bearer Token | Đổi mật khẩu |
| `GET` | `/users` | `user:view` | Lấy danh sách người dùng (Admin) |
| `GET` | `/users/:id` | `user:view` | Xem thông tin chi tiết người dùng theo ID |
| `POST` | `/users/:id/roles` | `user:update` | Gán Role cho người dùng |
| `DELETE` | `/users/:id/roles/:roleId` | `user:update` | Gỡ Role khỏi người dùng |
| `POST` | `/users/:id/permission-overrides` | `user:update` | Ghi đè quyền riêng (`ALLOW` hoặc `DENY`) cho User |
| `DELETE` | `/users/:id/permission-overrides/:permissionId` | `user:update` | Xóa quyền ghi đè |

---

## 🛡️ 3. Roles & Permissions (`/api/v1/roles`, `/api/v1/permissions`)

| Method | Endpoint | Bảo Mật | Mô Tả |
|---|---|---|---|
| `GET` | `/roles` | `role:view` | Lấy danh sách tất cả các vai trò |
| `GET` | `/roles/slug/:slug` | `role:view` | Lấy vai trò theo slug |
| `POST` | `/roles` | `role:create` | Tạo vai trò mới |
| `PATCH` | `/roles/:id` | `role:update` | Cập nhật vai trò & danh sách permissions |
| `DELETE` | `/roles/:id` | `role:delete` | Xóa vai trò |
| `GET` | `/permissions` | `permission:view` | Lấy danh sách toàn bộ mã phân quyền hệ thống |
| `GET` | `/permissions/module/:module` | `permission:view` | Lấy danh sách phân quyền theo Module |
| `PATCH` | `/permissions/:id` | `permission:update` | Cập nhật tên/mô tả phân quyền |

---

## 🛍️ 4. Products & Product Options (`/api/v1/products`, `/api/v1/product-options`)

| Method | Endpoint | Bảo Mật | Mô Tả |
|---|---|---|---|
| `GET` | `/products` | Public | Danh sách sản phẩm public (Hỗ trợ filter, pagination, sort) |
| `GET` | `/products/:slug` | Public | Chi tiết sản phẩm theo Slug |
| `POST` | `/products` | `product:create` | Tạo sản phẩm mới kèm biến thể & tùy chọn |
| `PATCH` | `/products/:id` | `product:update` | Cập nhật sản phẩm |
| `DELETE` | `/products/:id` | `product:delete` | Xóa mềm sản phẩm |
| `GET` | `/product-options` | Public | Danh sách tùy chọn sản phẩm (Màu sắc, Size...) |

---

## 🏷️ 5. Categories & Brands (`/api/v1/categories`, `/api/v1/brands`)

| Method | Endpoint | Bảo Mật | Mô Tả |
|---|---|---|---|
| `GET` | `/categories` | Public | Lấy cây danh mục sản phẩm |
| `GET` | `/categories/:slug` | Public | Xem danh mục theo slug |
| `POST` | `/categories` | `category:create` | Tạo danh mục mới |
| `PATCH` | `/categories/:id` | `category:update` | Cập nhật danh mục |
| `DELETE` | `/categories/:id` | `category:delete` | Xóa danh mục |
| `GET` | `/brands` | Public | Lấy danh sách thương hiệu |
| `GET` | `/brands/:slug` | Public | Xem thương hiệu theo slug |
| `POST` | `/brands` | `brand:create` | Tạo thương hiệu mới |
| `PATCH` | `/brands/:id` | `brand:update` | Cập nhật thương hiệu |
| `DELETE` | `/brands/:id` | `brand:delete` | Xóa thương hiệu |

---

## 🏪 6. Stores (`/api/v1/stores`)

| Method | Endpoint | Bảo Mật | Mô Tả |
|---|---|---|---|
| `GET` | `/stores/me` | `store:view` | Xem thông tin cửa hàng của tôi |
| `GET` | `/stores/:slug` | Public | Xem thông tin cửa hàng công khai |
| `POST` | `/stores` | `store:create` | Đăng ký cửa hàng mới |
| `PATCH` | `/stores` | `store:update` | Cập nhật thông tin cửa hàng |
| `DELETE` | `/stores` | `store:delete` | Xóa cửa hàng |

---

## 📦 7. Orders (`/api/v1/orders`)

| Method | Endpoint | Bảo Mật | Mô Tả |
|---|---|---|---|
| `POST` | `/orders` | `order:create` | Tạo đơn hàng mới |
| `POST` | `/orders/checkout` | `order:create` | Thanh toán & giữ chỗ kho hàng (Reserve inventory) |
| `GET` | `/orders` | `order:view` | Lấy danh sách đơn hàng |
| `GET` | `/orders/:id` | `order:view` | Xem chi tiết đơn hàng |
| `PATCH` | `/orders/:id/confirm` | `order:confirm` | Xác nhận đơn hàng |
| `PATCH` | `/orders/:id/ship` | `order:shipping` | Chuyển đơn hàng sang trạng thái đang giao |
| `PATCH` | `/orders/:id/complete` | `order:complete` | Hoàn thành đơn hàng |
| `PATCH` | `/orders/:id/cancel` | `order:cancel` | Hủy đơn hàng |

---

## 🖼️ 8. Media Uploads (`/api/v1/media`)

| Method | Endpoint | Bảo Mật | Mô Tả |
|---|---|---|---|
| `POST` | `/media` | Bearer Token | Upload file (multipart/form-data) lên Cloudinary |
| `GET` | `/media` | Bearer Token | Lấy danh sách media theo `ownerType` & `ownerId` |
| `PATCH` | `/media/:id/primary` | Bearer Token | Đặt media làm ảnh/video chính |
| `PATCH` | `/media/:id/alt` | Bearer Token | Cập nhật Alt text |
| `DELETE` | `/media/:id` | Bearer Token | Xóa media |

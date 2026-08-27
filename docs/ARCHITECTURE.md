# 🏛️ Architecture Documentation

Tài liệu chi tiết về kiến trúc phần mềm của dự án Backend E-Commerce.

---

## 1. Tổng Quan Kiến Trúc (Architecture Overview)

Dự án áp dụng mô hình **Enterprise Modular Monolith Architecture** (Kiến trúc đơn khối phân thân theo Domain). Mô hình này kết hợp tính đơn giản khi triển khai của Monolith với khả năng mở rộng, đóng gói và độc lập theo từng nghiệp vụ của Microservices.

```text
[ Client (Frontend / Mobile / Postman) ]
                   │
                   ▼
       [ Express 5 Central Router ]
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
[ Global Middlewares ]   [ Domain Modules ]
 (Auth, RateLimit,        (user, product, order,
  Validate, Error)         auth, store, media...)
                              │
                              ▼
                   [ Layered Responsibilities ]
                    Controller ➔ Service ➔ Repository ➔ Mongoose Model
                              │
                              ▼
                     [ MongoDB Database ]
```

---

## 2. Phân Tầng Trách Nhiệm (Layered Responsibilities)

Mỗi Domain Module trong thư mục `backend/modules/` bao gồm 6 thành phần chính với vai trò phân định rõ ràng:

### 1. Routes (`[module].routes.ts`)
- Định nghĩa các HTTP Endpoints (GET, POST, PUT, PATCH, DELETE).
- Gắn các middleware xử lý: `verifyToken`, `authorize(...)`, `validate(schema)`, `upload.single(...)`.
- Chuyển tiếp request sang Controller tương ứng.

### 2. Validation (`[module].validation.ts`)
- Định nghĩa các Zod Schemas để kiểm tra kiểu dữ liệu của `req.body`, `req.params`, và `req.query`.
- Đảm bảo dữ liệu đầu vào chuẩn xác trước khi chạm tới Controller/Service.
- Export các kiểu dữ liệu DTO (`type CreateUserDto = z.infer<...>`).

### 3. Controller (`[module].controller.ts`)
- Tiếp nhận Request từ Express Router.
- Trích xuất tham số (`req.params`, `req.query`, `req.body`, `req.user`).
- Gọi sang Service để xử lý logic nghiệp vụ.
- Trả về HTTP Response chuẩn hóa thông qua Helper `ApiResponse` (`ApiResponse.success`, `ApiResponse.created`, `ApiResponse.paginated`...).

### 4. Service (`[module].service.ts`)
- Chứa toàn bộ **Business Logic** của ứng dụng.
- Xử lý tính toán, ràng buộc dữ liệu (ví dụ: kiểm tra trùng slug, kiểm tra tồn kho, áp dụng mã giảm giá).
- Phối hợp giữa nhiều Repositories nếu cần.
- Quăng ra các lỗi nghiệp vụ chuẩn hóa `AppError` (`AppError.NotFound`, `AppError.BadRequest`, `AppError.Conflict`...).

### 5. Repository (`[module].repository.ts`)
- Thao tác trực tiếp với Database MongoDB thông qua Mongoose Model.
- Kế thừa từ `BaseRepository<T>` để tự động có các hàm CRUD cơ bản (`findById`, `findOne`, `findWithPagination`, `softDelete`, `restore`...).
- Mở rộng các truy vấn nâng cao đặc thù của domain (ví dụ: `findBySlug`, `findActiveUsers`...).

### 6. Model (`[module].model.ts`)
- Định nghĩa Mongoose Schema & TypeScript Interface (`IDocument`).
- Cấu hình Indexes, Compound Indexes, Virtual fields, Pre-save hooks (hash password...).

---

## 3. Quy Tắc Đóng Gói (Domain Encapsulation Rules)

1. **Độc lập Module**: Mỗi module phải tự quản lý Model và Logic của mình trong thư mục `modules/[module_name]/`. Không có thư mục `models/` toàn cục.
2. **Naming Convention**:
   - Tên thư mục module luôn dùng **lowercase singular** (chữ thường số ít): `user`, `product`, `order`, `store`, `media`...
   - Tên file tuân theo chuẩn: `[module].controller.ts`, `[module].service.ts`, `[module].repository.ts`, `[module].model.ts`, `[module].routes.ts`, `[module].validation.ts`.
3. **Quản lý Lỗi**: Tất cả ngoại lệ async phải được bọc bởi `asyncHandler` và bắt bởi `errorHandler` middleware ở tầng root.

---

## 4. Tầng Dùng Chung (Common Layer)

Thư mục `backend/common/` chứa các tiện ích dùng chung cho toàn hệ thống:
- `AppError.ts`: Lớp định nghĩa custom HTTP Error (`AppError.Unauthorized`, `AppError.Forbidden`, `AppError.NotFound`...).
- `api-response.ts`: Trả về JSON chuẩn hóa (`{ success: true, message: "...", data: ..., meta: ... }`).
- `async-handler.ts`: Wrapper tự động catch lỗi async và chuyển tới `next(error)`.
- `base.repository.ts`: Lớp repository mẫu hỗ trợ sẵn phân trang, soft delete, CRUD.

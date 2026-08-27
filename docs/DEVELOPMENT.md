# 💻 Developer Guide & Standards

Tài liệu hướng dẫn phát triển, quy chuẩn viết code và quy trình thêm Module mới cho lập trình viên.

---

## 1. Môi Trường Phát Triển (Development Setup)

### Lệnh khởi chạy cơ bản:
```bash
# Cài đặt thư viện
npm install

# Chạy dev server với nodemon & ts-node
npm run dev

# Khởi tạo dữ liệu mẫu (Permissions & Super Admin Role)
npm run seed

# Kiểm tra lỗi TypeScript không biên dịch
npm run type-check
```

---

## 2. Hướng Dẫn Thêm Một Domain Module Mới (Step-by-Step)

Giả sử bạn cần tạo một module mới tên là `notification`:

### Bước 1: Tạo thư mục module
Tạo thư mục `backend/modules/notification/` (tên thư mục **chữ thường số ít**).

### Bước 2: Tạo `notification.model.ts`
```typescript
import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  isRead: boolean;
}

const notificationSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const NotificationModel = model<INotification>('Notification', notificationSchema);
```

### Bước 3: Tạo `notification.repository.ts`
```typescript
import { BaseRepository } from '../../common/base.repository';
import { NotificationModel, INotification } from './notification.model';

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(NotificationModel);
  }
}

export const notificationRepository = new NotificationRepository();
```

### Bước 4: Tạo `notification.service.ts` & `notification.controller.ts`
Khai báo logic nghiệp vụ trong Service, bắt lỗi với `AppError`, và trả kết quả qua `ApiResponse` ở Controller.

### Bước 5: Tạo `notification.validation.ts`
Định nghĩa Zod Schema để validate input params & body.

### Bước 6: Tạo `notification.routes.ts` & đăng ký vào Central Router
Đăng ký router mới vào file `backend/routes/index.route.ts`:
```typescript
import notificationRoutes from '../modules/notification/notification.routes';
// ...
app.use(`${version}/notifications`, notificationRoutes);
```

---

## 3. Quy Chuẩn Viết Code (Coding Standards)

1. **Không Nuốt Lỗi (No Exception Swallowing)**: Mọi lỗi phải được `throw AppError` hoặc để `asyncHandler` truyền tới Error Middleware.
2. **Kiểm Thử Type Check Tự Động**: Luôn chạy `npm run type-check` trước khi commit code.
3. **Validate Tất Cả Input**: 100% Endpoints nhận dữ liệu từ `req.body`, `req.params`, `req.query` phải có Zod Schema tương ứng.

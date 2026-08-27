# 🛒 E-Commerce Backend Platform (Node.js + Express 5 + TypeScript + MongoDB)

Hệ thống RESTful API Backend chuyên nghiệp dành cho nền tảng thương mại điện tử (E-Commerce), được thiết kế theo kiến trúc **Enterprise Modular Monolith Architecture**, áp dụng **Domain-Driven Modularization**, bảo mật cao và tối ưu hóa hiệu năng.

---

## 📚 Bộ Tài Liệu Dự Án (Documentation Index)

Toàn bộ tài liệu kỹ thuật chi tiết của dự án được phân chia rõ ràng trong thư mục [`docs/`](./docs/):

```text
├── README.md
│
├── docs/
│   ├── ARCHITECTURE.md     # 🏛️ Chi tiết kiến trúc Modular Monolith & Layered pattern
│   ├── API.md              # 📑 Danh sách toàn bộ RESTful API Endpoints & Request/Response
│   ├── DATABASE.md         # 🗄️ Thiết kế CSDL MongoDB, Mongoose Models & Indexing
│   ├── AUTHENTICATION.md   # 🔐 Luồng xác thực JWT, Session Revocation, RBAC & Overrides
│   ├── DEVELOPMENT.md      # 💻 Hướng dẫn lập trình viên, Coding Standards & Thêm Module mới
│   └── DEPLOYMENT.md       # 🚀 Hướng dẫn triển khai Production (PM2, Docker, Nginx, Env)
```

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 🔐 1. Xác thực & Bảo mật (Authentication & Security)
- **JWT Auth**: Cấp phát `AccessToken` (ngắn hạn) & `RefreshToken` (dài hạn).
- **Quản lý Session Đa thiết bị**: Lưu vết thiết bị, IP Address, User-Agent; hỗ trợ đăng xuất từ xa, thu hồi session theo ID hoặc thu hồi tất cả các session khác.
- **Blacklisted Token**: Thu hồi AccessToken tức thì khi người dùng Logout.
- **Security Audit Logs**: Tự động ghi lại các nhật ký an ninh quan trọng.
- **Chi tiết xem tại**: [`docs/AUTHENTICATION.md`](./docs/AUTHENTICATION.md)

### 🛡️ 2. Phân Quyền Nâng Cao (RBAC & Permission Overrides)
- **Role-Based Access Control (RBAC)**: Phân quyền theo Vai trò với 2 phạm vi (`SYSTEM` & `STORE`).
- **User Permission Overrides**: Hỗ trợ ghi đè quyền trực tiếp theo từng User dạng `ALLOW` hoặc `DENY`.

### 📦 3. Quản lý Sản Phẩm & Tồn Kho (Products & Inventory)
- **Product & Product Variants**: Sản phẩm đa biến thể (Màu sắc, Size, SKU, Giá bán, Giá niêm yết).
- **Inventory Tracking & Transactions**: Theo dõi tồn kho thực tế, khả dụng (Available), giữ chỗ (Reserved), và nhật ký biến động kho.

### 🏪 4. Hệ Thống Thương Mại (E-Commerce Modules)
- **Store & Multi-Vendor**: Quản lý cửa hàng, nhân viên cửa hàng.
- **Category & Hierarchy**: Danh mục sản phẩm nhiều cấp (Parent-Child relationship).
- **Brands**: Quản lý thương hiệu & logo.
- **Orders & Workflow**: Quy trình xử lý đơn hàng chuẩn 6 bước.
- **Vouchers & Reviews**: Mã giảm giá, đánh giá & bình luận sản phẩm.
- **Media Upload**: Tải lên hình ảnh/video trực tiếp lên **Cloudinary** qua `Multer`, tự động quản lý ảnh chính (`isPrimary`).

---

## 🏗️ Cấu Trúc Dự Án (Project Directory Structure)

```text
backend/
├── common/                  # Utilities: ApiResponse, AppError, AsyncHandler, BaseRepository
├── config/                  # Config: Cloudinary, Database, Environment, JWT
├── constants/               # Permissions Constants
├── database/                # Seeders (Permissions, super-admin roles)
├── interfaces/              # TypeScript Interfaces
├── middlewares/             # Middlewares: Auth, Authorize, Validate (Zod), ErrorHandler
├── modules/                 # Domain Modules (Chữ thường số ít)
│   ├── auth/                # Auth, Sessions, Blacklisted Tokens, Audit Logs
│   ├── brand/               # Thương hiệu
│   ├── category/            # Danh mục đa cấp
│   ├── media/               # Media & Cloudinary Upload
│   ├── order/               # Đơn hàng & Luồng xử lý
│   ├── permission/          # Phân quyền hệ thống
│   ├── product/             # Sản phẩm, Biến thể, Tồn kho
│   ├── review/              # Đánh giá & Bình luận
│   ├── role/                # Vai trò & Tập quyền
│   ├── store/               # Cửa hàng
│   ├── user/                # Người dùng & Ghi đè quyền
│   └── voucher/             # Mã giảm giá
├── routes/                  # Central Router
├── app.ts                   # Express App Initialization
└── server.ts                # Bootstrap Server
```

Chi tiết xem tại: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Công Nghệ | Mô Tả |
|---|---|
| **Node.js** | Runtime Environment |
| **Express 5** | Web Framework mới nhất với async route handlers |
| **TypeScript** | Static Typing, nâng cao độ tin cậy của code |
| **MongoDB & Mongoose** | Database NoSQL & ODM Framework |
| **Zod** | Schema validation dữ liệu đầu vào |
| **JWT & Bcrypt** | Mã hóa mật khẩu & token xác thực |
| **Cloudinary & Multer** | Storage hình ảnh/video |

---

## 🚀 Hướng Dẫn Nhanh (Quick Start)

### 1. Cài đặt Dependencies & Cấu hình `.env`
```bash
npm install
```

Tạo file `.env` tại gốc dự án (tham khảo mẫu tại [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)).

### 2. Khởi tạo dữ liệu mẫu (Seed Permissions & Super Admin)
```bash
npm run seed
```

### 3. Khởi chạy Development Server
```bash
npm run dev
```
Server chạy tại: `http://localhost:5000`

### 4. Kiểm tra Type Check TypeScript
```bash
npm run type-check
```

---

## 📑 Danh Sách API Endpoints Tóm Tắt

Chi tiết đầy đủ tham số và câu lệnh xem tại: [`docs/API.md`](./docs/API.md).

- **Auth**: `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `POST /api/v1/auth/refresh`, `GET /api/v1/auth/sessions`
- **Users**: `GET /api/v1/users/me`, `GET /api/v1/users`, `POST /api/v1/users/:id/permission-overrides`
- **Products**: `GET /api/v1/products`, `POST /api/v1/products`
- **Categories**: `GET /api/v1/categories`, `POST /api/v1/categories`
- **Brands**: `GET /api/v1/brands`, `POST /api/v1/brands`
- **Stores**: `GET /api/v1/stores/me`, `POST /api/v1/stores`
- **Orders**: `POST /api/v1/orders/checkout`, `GET /api/v1/orders`
- **Media**: `POST /api/v1/media` (Upload Cloudinary), `GET /api/v1/media`

---

## 📝 License
Dự án được phát triển dưới giấy phép **ISC License**.

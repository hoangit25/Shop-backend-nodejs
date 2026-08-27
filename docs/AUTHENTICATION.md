# 🔐 Authentication & Authorization Documentation

Tài liệu chi tiết về hệ thống xác thực, quản lý phiên đăng nhập, thu hồi token và mô hình phân quyền 2 lớp (RBAC + Permission Overrides).

---

## 1. Cơ Chế Xác Thực JWT (JWT Auth Architecture)

Ứng dụng áp dụng cơ chế **Dual-Token Pattern**:

```text
[ Client Login ] ➔ POST /api/v1/auth/login
                       │
                       ▼
    ┌──────────────────┴──────────────────┐
    ▼                                     ▼
[ AccessToken ]                       [ RefreshToken ]
- Hạn dùng: 15 phút                   - Hạn dùng: 7 ngày
- Gửi kèm Header:                     - Lưu trong Session DB & Cookie
  Authorization: Bearer <token>       - Dùng để cấp lại AccessToken
```

---

## 2. Quản Lý Phiên Đăng Nhập Multi-Device (Session Revocation)

Mỗi lần người dùng đăng nhập thành công:
1. Hệ thống tạo một bản ghi mới trong collection `Sessions` chứa: `userId`, `refreshToken`, `ipAddress`, `userAgent`, `deviceName`, `expiresAt`.
2. Tạo cặp Token chứa `jti` (JWT ID).

### Luồng Thu Hồi Session:
- **Đăng xuất thiết bị hiện tại**: Xóa Session khỏi DB và thêm `jti` vào `BlacklistedTokens`.
- **Đăng xuất tất cả thiết bị khác (`DELETE /auth/sessions/other`)**: Giữ lại session hiện tại, thu hồi toàn bộ các session còn lại của `userId`.
- **Thu hồi session cụ thể (`DELETE /auth/sessions/:sessionId`)**: Admin hoặc người dùng chọn hủy kết nối thiết bị đáng ngờ.

---

## 3. Hệ Thống Phân Quyền (Dual-Layer Authorization Model)

Hệ thống kết hợp 2 tầng phân quyền:

```text
User ➔ Has Roles (e.g. Super Admin, Store Owner) ➔ Contains Permissions (e.g. product:create, order:view)
  │
  └─► Has Direct Permission Overrides (e.g. ALLOW category:delete, DENY order:cancel)
```

### Tầng 1: Role-Based Access Control (RBAC)
- Mỗi User được gán một hoặc nhiều **Role**.
- Mỗi Role có một danh sách `permissions` (mảng các ObjectId trỏ tới `PermissionModel`).
- Role được chia theo Scope: `SYSTEM` (Admin hệ thống) hoặc `STORE` (Quản lý cửa hàng).

### Tầng 2: User Permission Overrides (Ghi đè quyền trực tiếp)
Trong thực tế doanh nghiệp, một nhân viên cụ thể có thể được cấp thêm quyền đặc biệt hoặc bị cấm một quyền nào đó mà không muốn tạo Role mới.
- Schema User có trường `permissionOverrides: [{ permission: ObjectId, effect: 'ALLOW' | 'DENY' }]`.
- **Quy tắc đánh giá quyền (Authorize Algorithm)**:
  1. Kiểm tra nếu User có override `DENY` cho permission đó ➔ **Từ chối ngay tức thì (Forbidden)**.
  2. Kiểm tra nếu User có override `ALLOW` cho permission đó ➔ **Cho phép truy cập ngay (Granted)**.
  3. Nếu không có override ➔ Kiểm tra xem tập quyền từ các **Roles** có chứa permission hay không.

---

## 4. Security Audit Logs (Nhật Ký An Ninh)

Mọi hành vi liên quan tới bảo mật đều tự động kích hoạt `AuditLogService.record(...)` để ghi nhận:
- Hành động: `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `REFRESH_TOKEN_FAILED`, `SESSION_REVOKED`...
- Thông tin: `userId`, `email`, `status`, `ipAddress`, `userAgent`, `details`.

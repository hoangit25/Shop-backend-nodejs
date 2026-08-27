# 🚀 Deployment Documentation

Tài liệu hướng dẫn triển khai ứng dụng lên môi trường Production (Server, Docker, PM2, Cloudinary, MongoDB Atlas).

---

## 1. Chuẩn Bị Biến Môi Trường Production (`.env`)

```env
PORT=5000
NODE_ENV=production

# MongoDB Production Connection (MongoDB Atlas hoặc Replica Set)
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shop_prod?retryWrites=true&w=majority

# JWT Production Secrets (Dùng chuỗi mã hóa ngẫu nhiên 64+ ký tự)
JWT_ACCESS_SECRET=prod_access_secret_key_change_this_in_production_123456789
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=prod_refresh_secret_key_change_this_in_production_987654321
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_prod_cloud_name
CLOUDINARY_API_KEY=your_prod_api_key
CLOUDINARY_API_SECRET=your_prod_api_secret
```

---

## 2. Quy Trình Build & Chạy Ứng Dụng

### Bước 1: Biên dịch TypeScript sang JavaScript
```bash
npm run build
```
Lệnh này sẽ biên dịch toàn bộ code TypeScript từ `backend/` vào thư mục `dist/`.

### Bước 2: Khởi tạo Dữ liệu Ban Đầu (Permissions & Roles)
```bash
npm run seed
```

### Bước 3: Chạy ứng dụng bằng PM2 (Process Manager)
```bash
# Cài đặt PM2 toàn cục nếu chưa có
npm install -g pm2

# Khởi chạy ứng dụng với PM2
pm2 start dist/server.js --name "shop-backend" --instances max

# Cấu hình PM2 tự khởi động cùng OS
pm2 startup
pm2 save
```

---

## 3. Triển Khai Với Docker (Optional)

### `Dockerfile`
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/server.js"]
```

### Chạy Container:
```bash
docker build -t shop-backend .
docker run -d -p 5000:5000 --env-file .env --name shop-backend-app shop-backend
```

---

## 4. Bảo Mật & Tối Ưu Hóa Production (Security Checklist)

- ✅ **SSL/TLS**: Luôn chạy ứng dụng đằng sau Nginx Reverse Proxy với HTTPS.
- ✅ **Helmet Headers**: Đã bật sẵn trong `app.ts` để chặn Clickjacking, XSS, MIME sniffing.
- ✅ **Rate Limiting**: Hạn chế số lượng request từ 1 IP để chống Brute Force / DDoS (`express-rate-limit`).
- ✅ **CORS**: Đổi `cors()` thành danh sách Origin cố định của trang Web Frontend Production.

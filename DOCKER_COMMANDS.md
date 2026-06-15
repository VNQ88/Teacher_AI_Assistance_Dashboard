# Docker Commands — Teacher AI Dashboard Frontend

Tổng hợp các lệnh để build và chạy frontend bằng Docker / Docker Compose.

- **Image:** `vnq88/teacher-ai-dashboard-frontend:latest`
- **Container:** `teacher-ai-frontend`
- **Port:** `3000`
- Chạy các lệnh trong thư mục `frontend/`.

---

## 1. Chuẩn bị

### Tạo network `backend` (chỉ cần làm 1 lần)
File `docker-compose.yml` dùng network external tên `backend`:

```bash
docker network create backend
```

### File môi trường
- `.env` — biến runtime, được nạp qua `env_file` khi chạy container.
- Biến `NEXT_PUBLIC_API_URL` được truyền vào lúc **build** (build arg).

---

## 2. Build image

### Cách A — Docker Compose (khuyến nghị)
Dùng `docker-compose.build.yml` (đã cấu hình build args + network host):

```bash
# Truyền API URL khi build
NEXT_PUBLIC_API_URL=https://your-api-url docker compose -f docker-compose.build.yml build

# Hoặc nếu đã có trong .env
docker compose -f docker-compose.build.yml build
```

### Cách B — Docker thuần

```bash
docker build \
  --network host \
  --build-arg NEXT_PUBLIC_API_URL=https://your-api-url \
  -t vnq88/teacher-ai-dashboard-frontend:latest \
  .
```

---

## 3. Chạy ứng dụng

### Cách A — Docker Compose (khuyến nghị)
Dùng `docker-compose.yml` (nạp `.env`, gắn network `backend`, tự restart):

```bash
# Chạy nền
docker compose up -d

# Xem log
docker compose logs -f

# Dừng và xóa container
docker compose down
```

### Cách B — Docker thuần

```bash
docker run -d \
  --name teacher-ai-frontend \
  --env-file .env \
  -p 3000:3000 \
  --restart unless-stopped \
  vnq88/teacher-ai-dashboard-frontend:latest
```

---

## 4. Build + Chạy gộp

```bash
# Build rồi chạy ngay
docker compose -f docker-compose.build.yml build && docker compose up -d
```

---

## 5. Push / Pull image (Docker Hub)

```bash
# Đăng nhập
docker login

# Đẩy image lên registry
docker push vnq88/teacher-ai-dashboard-frontend:latest

# Kéo image về máy khác
docker pull vnq88/teacher-ai-dashboard-frontend:latest
```

---

## 6. Lệnh hữu ích khác

```bash
# Liệt kê container đang chạy
docker ps

# Vào shell trong container
docker exec -it teacher-ai-frontend sh

# Xem log container
docker logs -f teacher-ai-frontend

# Khởi động lại
docker restart teacher-ai-frontend

# Build lại không dùng cache
docker compose -f docker-compose.build.yml build --no-cache

# Dọn dẹp image/cache không dùng
docker system prune -f
```

---

## Tham khảo nhanh

| Việc cần làm        | Lệnh                                                          |
|---------------------|--------------------------------------------------------------|
| Tạo network         | `docker network create backend`                              |
| Build               | `docker compose -f docker-compose.build.yml build`           |
| Chạy                | `docker compose up -d`                                        |
| Xem log             | `docker compose logs -f`                                      |
| Dừng                | `docker compose down`                                         |
| Push                | `docker push vnq88/teacher-ai-dashboard-frontend:latest`     |

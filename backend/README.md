# Install

`npm install`

Sau đó vào packages.json và xem các script
* `npm run start`: Chạy NodeJS app bình thường
* `npm run start:dev`: Chạy project NodeJS app dưới dạng develop, khi thay đổi thì ứng dụng tự refresh sử dụng package **nodemon**

# Workflow
Bắt đầu từ `routes/api.js` trước, gọi controller và hàm tương ứng, kết nối với cơ sở dữ liệu sử dụng Sequelize

Với api response đã được format thông qua `responseUtil.ok()`: Xem chi tiết ở `modules/sample/controllers/sample.js` hàm `helloWorld()`. Chú ý không xóa thư mục này

Đối với api response not found sẽ được format thông qua `responseUtil.[tên_method](res, data)`

Chi tiết về response được viết trong `services/responseUtil.js`. Xem mẫu thư mục `modules/sample` để nắm được cách làm

# Packages
* Express-validator: Dùng để validate request (required, min-length, ...)
* Multer: Thực hiện file upload
* Body-parser: Xử lí form body
* Jwt: tạo token jwt cho đăng nhập
* Jest: Unit test và integration test

# Database (SQLite / Postgres)

## SQLite (default for dev)

1. Copy env: `.env.example` → `.env`
2. Run migrations: `npm run db:migrate`
3. Import CSV dataset: `npm run db:import:csv`

Options:
- `--csv <path>` (default: `data/complete_house_dataset.csv`)
- `--batch <n>` (default: 1000)
- `--truncate` (clear `houses` before import)

## Postgres (optional)

1. Set `DATABASE_ENV=production` and configure in `.env`:
- `PROD_DB_USERNAME`, `PROD_DB_PASSWORD`, `PROD_DB_NAME`, `PROD_DB_HOSTNAME`, `PROD_DB_PORT`
2. Run migrations + import:
- `npm run db:migrate`
- `npm run db:import:csv`

# Naming convention
* Đối với thư mục `modules/controllers/XXX`, cần đặt tên file theo quy tắc `xXXController.js`, ví dụ: `categoryController.js`
* Đối với thư mục `models`, các file bên trong đặt tên cần đặt số ít. Ví dụ: `user.js`, `category.js`
* Đối với thư mục `middlewares`, các file bên trong cần đặt tên file theo quy tắc `xXXMiddleware.js`, ví dụ: `demoMiddleware.js`

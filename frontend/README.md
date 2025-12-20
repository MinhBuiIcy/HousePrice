# House Price Prediction - Frontend

Web application frontend cho dự án dự đoán giá nhà sử dụng React + TypeScript + Material-UI.

## Tính năng

- ✅ **Bản đồ giá**: Hiển thị vị trí và giá nhà trên bản đồ (sử dụng mock data)
- ✅ **Dashboard**: Thống kê và biểu đồ phân tích dữ liệu
- ✅ **Dự đoán giá**: Form nhập liệu để dự đoán giá nhà bằng AI
- ✅ **Responsive**: Giao diện tương thích mọi thiết bị

## Tech Stack

- React 18
- TypeScript
- Material-UI (MUI)
- React Router DOM
- Recharts (biểu đồ)
- Leaflet + OpenStreetMap (bản đồ - miễn phí)
- Vite (build tool)

## Cài đặt

### 1. Install dependencies

```bash
npm install
```

### 2. Cấu hình environment variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` nếu cần:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

**Lưu ý**:
- App sử dụng **Leaflet/OpenStreetMap** (miễn phí), không cần Google Maps API key
- Hiện tại app sử dụng mock data, không cần backend API

### 3. Chạy development server

```bash
npm run dev
```

App sẽ chạy tại: http://localhost:5173

## Cấu trúc thư mục

```
src/
├── components/
│   ├── Common/
│   │   └── Layout.tsx          # Layout chính với sidebar
│   ├── Dashboard/
│   │   └── Dashboard.tsx       # Dashboard với charts
│   ├── Map/
│   │   └── PriceMap.tsx        # Bản đồ giá nhà
│   └── Prediction/
│       └── PredictionForm.tsx  # Form dự đoán giá
├── data/
│   └── mockHouses.ts           # Mock data từ CSV
├── pages/
│   └── Home.tsx                # Trang chủ
├── services/
│   └── api.ts                  # Mock API service
├── types/
│   └── house.ts                # TypeScript types
├── utils/
│   └── formatters.ts           # Helper functions
├── App.tsx                     # Main app với routing
└── main.tsx                    # Entry point
```

## Mock Data

App hiện đang sử dụng mock data từ file `src/data/mockHouses.ts` chứa 16 căn nhà mẫu.

Mock API service (`src/services/api.ts`) mô phỏng các API endpoints:
- `getHouses()` - Lấy danh sách nhà với filters
- `getMapMarkers()` - Lấy dữ liệu cho bản đồ
- `getStatsOverview()` - Thống kê tổng quan
- `getPriceDistribution()` - Phân bố giá
- `predictPrice()` - Dự đoán giá (thuật toán đơn giản)
- `getDistricts()` - Danh sách quận
- `getWards()` - Danh sách phường

## Kết nối với Backend

Khi backend API đã sẵn sàng, chỉ cần:

1. Update file `src/services/api.ts` để gọi real API thay vì mock data
2. Cấu hình `VITE_API_BASE_URL` trong `.env`

Ví dụ:

```typescript
// Thay vì mock data
async getHouses(filters?: HouseFilters): Promise<Response> {
  // Gọi real API
  const response = await fetch(`${API_BASE_URL}/houses?${params}`);
  return response.json();
}
```

## Build Production

```bash
npm run build
```

Output sẽ được tạo trong thư mục `dist/`.

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Chạy ESLint

## Leaflet Maps

App sử dụng **Leaflet + OpenStreetMap** thay vì Google Maps vì:
- ✅ Hoàn toàn miễn phí, không cần billing
- ✅ Không cần API key
- ✅ Bản đồ đẹp, chi tiết
- ✅ Fullscreen map với markers màu sắc theo giá
- ✅ Popup hiển thị thông tin khi click marker

### Màu markers:
- 🟢 Xanh lá: < 5 tỷ
- 🟡 Vàng: 5-10 tỷ
- 🟠 Cam: 10-20 tỷ
- 🔴 Đỏ: > 20 tỷ

## Tính năng sắp tới

- [ ] Kết nối backend API thực tế
- [ ] Filters nâng cao với sidebar
- [ ] Chi tiết căn nhà (modal/page)
- [ ] So sánh nhiều căn nhà
- [ ] Export data to Excel/PDF
- [ ] Dark mode
- [ ] Internationalization (i18n)
- [ ] Clustering markers khi zoom out
- [ ] Search box trên map

## License

MIT

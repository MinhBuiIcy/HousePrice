# Backend API Requirements

Tài liệu này mô tả các API endpoints mà backend cần implement để frontend hoạt động.

## Base URL

```
http://localhost:8000/api/v1
```

## Database Schema

### Table: `houses`

```sql
CREATE TABLE houses (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    area REAL,
    date INTEGER,
    city TEXT,
    district TEXT,
    ward TEXT,
    street TEXT,
    lat REAL,
    lng REAL,
    body TEXT,
    rooms INTEGER,
    toilets INTEGER,
    floors INTEGER,
    legal INTEGER,
    seller_type BOOLEAN,
    protection BOOLEAN,
    image_count INTEGER,
    image_thumb TEXT,
    width REAL,
    length REAL,
    pty_characteristics TEXT,
    owner_type BOOLEAN,
    is_pro BOOLEAN,
    verified BOOLEAN,
    page INTEGER,
    date_formatted DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_price ON houses(price);
CREATE INDEX idx_area ON houses(area);
CREATE INDEX idx_location ON houses(city, district, ward);
CREATE INDEX idx_coordinates ON houses(lat, lng);
CREATE INDEX idx_date ON houses(date);
```

### Table: `predictions` (Optional - lưu lịch sử dự đoán)

```sql
CREATE TABLE predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area REAL NOT NULL,
    rooms INTEGER,
    toilets INTEGER,
    floors INTEGER,
    district TEXT,
    ward TEXT,
    lat REAL,
    lng REAL,
    width REAL,
    length REAL,
    predicted_price REAL NOT NULL,
    confidence_lower REAL,
    confidence_upper REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### 1. GET `/houses` - Lấy danh sách nhà

**Query Parameters:**
```typescript
{
  page?: number           // Default: 1
  limit?: number          // Default: 20
  min_price?: number
  max_price?: number
  min_area?: number
  max_area?: number
  city?: string
  district?: string
  ward?: string
  min_rooms?: number
  max_rooms?: number
  sort_by?: 'price' | 'area' | 'date'
  sort_order?: 'asc' | 'desc'
}
```

**Response:**
```json
{
  "data": [
    {
      "id": 165308404,
      "title": "Bán Nhà Thạch Bàn 59m2 x 7 tầng",
      "price": 17500000000,
      "area": 59.0,
      "date": 1766120595000,
      "city": "Hà Nội",
      "district": "Quận Long Biên",
      "ward": "Phường Thạch Bàn",
      "street": "Đường Nguyễn Văn Linh",
      "lat": 21.027077,
      "lng": 105.923355,
      "body": "DT:59,1m2,MT:4m đường thông...",
      "rooms": 5,
      "toilets": 5,
      "floors": 7,
      "legal": 1,
      "seller_type": true,
      "protection": false,
      "image_count": 10,
      "image_thumb": "https://...",
      "width": 4.0,
      "length": 15.0,
      "pty_characteristics": "[2]",
      "owner_type": true,
      "is_pro": true,
      "verified": false,
      "page": 0,
      "dateFormatted": "2025-12-19"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5
}
```

### 2. GET `/houses/{id}` - Lấy chi tiết một căn nhà

**Response:**
```json
{
  "id": 165308404,
  "title": "...",
  "price": 17500000000,
  // ... all house fields
}
```

### 3. GET `/houses/map` - Lấy dữ liệu cho bản đồ (optimized)

**Query Parameters:**
```typescript
{
  bounds?: {              // Map boundaries (optional)
    north: number,
    south: number,
    east: number,
    west: number
  },
  min_price?: number,
  max_price?: number,
  district?: string
}
```

**Response:**
```json
{
  "markers": [
    {
      "id": 165308404,
      "lat": 21.027077,
      "lng": 105.923355,
      "price": 17500000000,
      "title": "Bán Nhà Thạch Bàn...",
      "area": 59.0,
      "image_thumb": "https://...",
      "price_category": "very_high"
    }
  ]
}
```

**Price categories:**
- `"low"`: price < 5,000,000,000
- `"medium"`: 5,000,000,000 <= price < 10,000,000,000
- `"high"`: 10,000,000,000 <= price < 20,000,000,000
- `"very_high"`: price >= 20,000,000,000

### 4. GET `/stats/overview` - Thống kê tổng quan

**Response:**
```json
{
  "total_houses": 16,
  "average_price": 11234567890,
  "median_price": 9200000000,
  "average_area": 68.5,
  "price_range": {
    "min": 1800000000,
    "max": 45000000000
  },
  "most_expensive_district": "Quận Long Biên",
  "most_affordable_district": "Quận Hoàng Mai",
  "total_value": 179753085000
}
```

### 5. GET `/stats/price-distribution` - Phân bố giá

**Response:**
```json
{
  "histogram": [
    {
      "range": "0-2 tỷ",
      "count": 1,
      "percentage": 6.25
    },
    {
      "range": "2-5 tỷ",
      "count": 2,
      "percentage": 12.5
    },
    {
      "range": "5-10 tỷ",
      "count": 5,
      "percentage": 31.25
    },
    {
      "range": "10-20 tỷ",
      "count": 6,
      "percentage": 37.5
    },
    {
      "range": "20-50 tỷ",
      "count": 2,
      "percentage": 12.5
    }
  ],
  "by_district": [
    {
      "district": "Quận Long Biên",
      "average_price": 14500000000,
      "median_price": 13950000000,
      "count": 6
    },
    {
      "district": "Quận Hà Đông",
      "average_price": 13600000000,
      "median_price": 13600000000,
      "count": 2
    }
  ]
}
```

### 6. POST `/predict` - Dự đoán giá nhà

**Request Body:**
```json
{
  "area": 50,              // Required
  "rooms": 3,
  "toilets": 2,
  "floors": 4,
  "district": "Quận Long Biên",
  "ward": "Phường Thạch Bàn",
  "lat": 21.027077,
  "lng": 105.923355,
  "width": 5,
  "length": 10,
  "legal": 1
}
```

**Response:**
```json
{
  "predicted_price": 7000000000,
  "confidence_interval": {
    "lower": 5950000000,
    "upper": 8050000000
  },
  "similar_houses": [
    {
      "id": 165308404,
      "price": 7500000000,
      "area": 40,
      "distance_km": 0.5
    },
    {
      "id": 172448163,
      "price": 7850000000,
      "area": 55,
      "distance_km": 1.2
    }
  ],
  "price_per_m2": 140000000,
  "prediction_id": 12345
}
```

### 7. GET `/filters/districts` - Danh sách quận

**Response:**
```json
{
  "districts": [
    "Huyện Hoài Đức",
    "Quận Ba Đình",
    "Quận Cầu Giấy",
    "Quận Hà Đông",
    "Quận Hai Bà Trưng",
    "Quận Hoàng Mai",
    "Quận Long Biên",
    "Quận Thanh Xuân",
    "Quận Tây Hồ"
  ]
}
```

### 8. GET `/filters/wards` - Danh sách phường theo quận

**Query Parameters:**
```typescript
{
  district: string    // Required
}
```

**Response:**
```json
{
  "wards": [
    "Phường Bạch Mai",
    "Phường Biên Giang",
    "Phường Cự Khối",
    "Phường Hoàng Liệt",
    "Phường Liễu Giai"
  ]
}
```

## CORS Configuration

Backend cần enable CORS cho frontend:

```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Import CSV Data

Script để import `complete_house_dataset.csv` vào SQLite:

```python
import pandas as pd
import sqlite3

# Read CSV
df = pd.read_csv('complete_house_dataset.csv')

# Connect to SQLite
conn = sqlite3.connect('house_prices.db')

# Import to table
df.to_sql('houses', conn, if_exists='replace', index=False)

# Create indexes
cursor = conn.cursor()
cursor.execute('CREATE INDEX idx_price ON houses(price)')
cursor.execute('CREATE INDEX idx_area ON houses(area)')
cursor.execute('CREATE INDEX idx_location ON houses(city, district, ward)')
cursor.execute('CREATE INDEX idx_coordinates ON houses(lat, lng)')
cursor.execute('CREATE INDEX idx_date ON houses(date)')
conn.commit()
conn.close()
```

## Machine Learning Model

Backend cần train và load ML model để dự đoán giá:

### Features cần thiết:
- **Numerical**: area, rooms, toilets, floors, width, length, lat, lng
- **Categorical**: district, ward, legal, pty_characteristics

### Model suggestions:
- XGBoost Regressor
- LightGBM
- Random Forest

### Preprocessing:
- StandardScaler cho numerical features
- OneHotEncoder hoặc TargetEncoder cho categorical features
- Handle missing values

### Evaluation metrics:
- RMSE (Root Mean Squared Error)
- MAE (Mean Absolute Error)
- R² Score

## Testing

Dùng mock data từ frontend để test:

```bash
# Test lấy danh sách
curl http://localhost:8000/api/v1/houses?page=1&limit=10

# Test dự đoán
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{"area": 50, "rooms": 3, "floors": 4}'

# Test thống kê
curl http://localhost:8000/api/v1/stats/overview
```

## Deployment Notes

1. **Database**: SQLite cho dev, PostgreSQL cho production
2. **Model**: Lưu model file (.pkl) vào `models/` directory
3. **Static files**: Serve frontend build từ `frontend/dist/`
4. **Environment variables**:
   - `DATABASE_URL`
   - `MODEL_PATH`
   - `CORS_ORIGINS`

## Next Steps

1. ✅ Setup FastAPI project structure
2. ✅ Import CSV vào SQLite
3. ✅ Implement CRUD endpoints cho houses
4. ✅ Implement statistics endpoints
5. ✅ Train ML model
6. ✅ Implement predict endpoint
7. ✅ Add pagination & filters
8. ✅ Test với frontend
9. ✅ Deploy

## Support

Nếu có câu hỏi về API, liên hệ frontend team hoặc xem `src/services/api.ts` để hiểu cách frontend gọi API.

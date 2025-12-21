# House Price Prediction Web Application

Ứng dụng web dự đoán giá nhà tại Hà Nội với Machine Learning, bản đồ tương tác, và dashboard thống kê.

## 🚀 Quick Start

### Frontend (Đã hoàn thành - Sẵn sàng sử dụng)

```bash
cd frontend
npm install
npm run dev
# Mở http://localhost:5173
```

**Frontend đã có đầy đủ 3 tính năng:**
- ✅ Bản đồ giá fullscreen với Leaflet/OpenStreetMap
- ✅ Dashboard với charts và thống kê
- ✅ Form dự đoán giá với mock ML algorithm

**Sử dụng mock data** - không cần backend để test UI

### Backend (Cần implement)

Xem hướng dẫn chi tiết trong `frontend/BACKEND_API.md`

```bash
# TODO: Backend team implement
cd backend
pip install -r requirements.txt
python scripts/import_data.py  # Import CSV vào SQLite
python scripts/train_model.py  # Train ML model
uvicorn app.main:app --reload
```

## 📋 Tổng Quan Dự Án

Ứng dụng web dự đoán giá nhà sử dụng Machine Learning, cung cấp giao diện trực quan để:
- Hiển thị bản đồ giá nhà theo vị trí địa lý (Leaflet + OpenStreetMap)
- Thống kê và phân tích dữ liệu thị trường bất động sản (Recharts)
- Dự đoán giá nhà dựa trên các đặc điểm đầu vào (ML model)

## ✨ Tính Năng Chính

### 1. 🗺️ Bản Đồ Giá (Price Map) ✅ HOÀN THÀNH
- **Leaflet + OpenStreetMap** (miễn phí, không cần API key)
- **Fullscreen map** hiển thị toàn màn hình
- **Markers động** thể hiện vị trí các căn nhà với mã màu theo mức giá:
  - 🟢 Xanh lá: < 5 tỷ
  - 🟡 Vàng: 5-10 tỷ
  - 🟠 Cam: 10-20 tỷ
  - 🔴 Đỏ: > 20 tỷ
- **Popup** hiển thị thông tin chi tiết khi click vào marker:
  - Ảnh thumbnail
  - Tiêu đề
  - Giá
  - Diện tích
- **Legend** chú thích màu sắc
- **Responsive** tương thích mobile

### 2. 📊 Dashboard Thống Kê ✅ HOÀN THÀNH
- **Overview cards**: Tổng số căn, giá TB, giá trung vị, DT TB
- **Biểu đồ phân bố giá**:
  - Bar chart theo khoảng giá (0-2 tỷ, 2-5 tỷ, etc.)
  - Pie chart phân bố phần trăm
- **Giá theo quận**:
  - Bar chart giá trung bình top 10 quận
  - Hiển thị số lượng căn mỗi quận
- **Key insights**:
  - Quận đắt nhất / rẻ nhất
  - Khoảng giá min-max
  - Tổng giá trị thị trường
- **Recharts** cho visualization
- **Mock data** với 16 căn nhà mẫu

### 3. 🤖 Price Prediction ✅ HOÀN THÀNH
- **Form nhập liệu** đầy đủ:
  - Diện tích (m²) - Required
  - Số phòng ngủ, toilet, tầng
  - Quận/huyện, phường (dropdown)
  - Tọa độ (lat/lng)
  - Chiều rộng/dài
- **Kết quả dự đoán** (mock algorithm):
  - Giá dự đoán
  - Khoảng tin cậy 85%-115%
  - Giá / m²
  - 3 căn nhà tương tự
- **Validation** form đầy đủ
- **Sẵn sàng** kết nối ML model từ backend

## 🏗️ Kiến Trúc Hệ Thống

### Tech Stack

#### Backend
- **Framework**: FastAPI (Python 3.11+)
  - High performance, async support
  - Automatic OpenAPI documentation
  - Type hints và validation
- **Database**: SQLite
  - Lightweight, serverless
  - Phù hợp cho prototype và production nhỏ
- **ML Framework**:
  - scikit-learn (cho model cơ bản)
  - XGBoost/LightGBM (cho model nâng cao)
  - joblib (serialize model)
- **Data Processing**:
  - pandas (xử lý CSV, data transformation)
  - numpy (tính toán)
- **API Documentation**: Swagger UI (tự động từ FastAPI)

#### Frontend ✅ HOÀN THÀNH
- **Framework**: React 18 với TypeScript
- **UI Library**: Material-UI (MUI v5)
- **Maps**: Leaflet + OpenStreetMap (miễn phí, không cần API key)
- **Charts**: Recharts
- **Routing**: React Router DOM v6
- **Build Tool**: Vite
- **Mock Data**: 16 căn nhà từ CSV
- **Status**: Đầy đủ 3 tính năng, sẵn sàng kết nối backend

### Project Structure

```
HousePrice/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entry
│   │   ├── config.py               # Configuration settings
│   │   ├── database.py             # Database connection & models
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── house.py           # SQLAlchemy models
│   │   │   └── schemas.py         # Pydantic schemas
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── houses.py      # CRUD operations
│   │   │   │   ├── predict.py     # ML prediction endpoint
│   │   │   │   └── stats.py       # Statistics endpoints
│   │   │   └── dependencies.py
│   │   ├── ml/
│   │   │   ├── __init__.py
│   │   │   ├── model.py           # ML model wrapper
│   │   │   ├── training.py        # Training pipeline
│   │   │   ├── preprocessing.py   # Feature engineering
│   │   │   └── models/            # Saved models (.pkl)
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── house_service.py
│   │   │   └── prediction_service.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── helpers.py
│   ├── scripts/
│   │   ├── import_data.py         # Import CSV to SQLite
│   │   └── train_model.py         # Train ML model
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_api.py
│   │   └── test_model.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── PriceMap.tsx
│   │   │   │   ├── MapMarker.tsx
│   │   │   │   ├── InfoWindow.tsx
│   │   │   │   └── MapFilters.tsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── PriceChart.tsx
│   │   │   │   ├── AreaChart.tsx
│   │   │   │   ├── TrendChart.tsx
│   │   │   │   └── StatsCard.tsx
│   │   │   ├── Prediction/
│   │   │   │   ├── PredictionForm.tsx
│   │   │   │   └── PredictionResult.tsx
│   │   │   ├── Common/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Layout.tsx
│   │   │   └── Filters/
│   │   │       ├── PriceFilter.tsx
│   │   │       ├── AreaFilter.tsx
│   │   │       └── LocationFilter.tsx
│   │   ├── hooks/
│   │   │   ├── useHouses.ts
│   │   │   ├── useStats.ts
│   │   │   └── usePrediction.ts
│   │   ├── services/
│   │   │   └── api.ts             # API client
│   │   ├── types/
│   │   │   └── house.ts           # TypeScript types
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   └── mapHelpers.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
│
├── data/
│   ├── complete_house_dataset.csv
│   └── house_prices.db            # SQLite database
│
├── models/
│   ├── price_predictor.pkl        # Trained model
│   └── feature_scaler.pkl         # Preprocessing scaler
│
├── docs/
│   ├── API.md                     # API documentation
│   ├── SETUP.md                   # Setup guide
│   └── DEPLOYMENT.md              # Deployment guide
│
├── .gitignore
├── README.md
└── docker-compose.yml             # Docker setup (optional)
```

## 🗄️ Database Schema

### SQLite Database: `house_prices.db`

#### Table: `houses`
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

-- Indexes for optimization
CREATE INDEX idx_price ON houses(price);
CREATE INDEX idx_area ON houses(area);
CREATE INDEX idx_location ON houses(city, district, ward);
CREATE INDEX idx_coordinates ON houses(lat, lng);
CREATE INDEX idx_date ON houses(date);
```

#### Table: `predictions` (Lưu lịch sử dự đoán)
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

## 🔌 API Endpoints

### Base URL: `http://localhost:8000/api/v1`

#### Houses Endpoints

```
GET    /houses              # Lấy danh sách nhà (có pagination & filters)
GET    /houses/{id}         # Lấy thông tin chi tiết 1 căn nhà
GET    /houses/map          # Lấy dữ liệu cho bản đồ (optimized)
POST   /houses              # Thêm nhà mới (admin)
PUT    /houses/{id}         # Cập nhật thông tin nhà
DELETE /houses/{id}         # Xóa nhà
```

#### Statistics Endpoints

```
GET    /stats/overview              # Thống kê tổng quan
GET    /stats/price-distribution    # Phân bố giá
GET    /stats/area-distribution     # Phân bố diện tích
GET    /stats/by-district           # Thống kê theo quận
GET    /stats/trends                # Xu hướng giá theo thời gian
GET    /stats/heatmap               # Dữ liệu heatmap
```

#### Prediction Endpoint

```
POST   /predict             # Dự đoán giá nhà
```

#### Filters & Search

```
GET    /filters/districts   # Danh sách quận
GET    /filters/wards       # Danh sách phường
GET    /search              # Tìm kiếm nhà
```

### Chi Tiết API Endpoints

#### 1. GET `/houses` - Lấy danh sách nhà

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
```typescript
{
  data: House[],
  total: number,
  page: number,
  limit: number,
  pages: number
}
```

#### 2. GET `/houses/map` - Dữ liệu cho bản đồ

**Query Parameters:**
```typescript
{
  bounds?: {              // Map boundaries
    north: number,
    south: number,
    east: number,
    west: number
  },
  min_price?: number,
  max_price?: number,
  // ... other filters
}
```

**Response:**
```typescript
{
  markers: Array<{
    id: number,
    lat: number,
    lng: number,
    price: number,
    title: string,
    area: number,
    image_thumb: string,
    price_category: 'low' | 'medium' | 'high' | 'very_high'
  }>
}
```

#### 3. POST `/predict` - Dự đoán giá

**Request Body:**
```typescript
{
  area: number,           // Required
  rooms?: number,
  toilets?: number,
  floors?: number,
  district?: string,
  ward?: string,
  lat?: number,
  lng?: number,
  width?: number,
  length?: number,
  legal?: number,
  pty_characteristics?: string[]
}
```

**Response:**
```typescript
{
  predicted_price: number,
  confidence_interval: {
    lower: number,
    upper: number
  },
  similar_houses: Array<{
    id: number,
    price: number,
    area: number,
    distance_km: number
  }>,
  price_per_m2: number,
  prediction_id: number
}
```

#### 4. GET `/stats/overview` - Thống kê tổng quan

**Response:**
```typescript
{
  total_houses: number,
  average_price: number,
  median_price: number,
  average_area: number,
  price_range: {
    min: number,
    max: number
  },
  most_expensive_district: string,
  most_affordable_district: string,
  total_value: number
}
```

#### 5. GET `/stats/price-distribution` - Phân bố giá

**Response:**
```typescript
{
  histogram: Array<{
    range: string,          // "0-5B", "5-10B", etc.
    count: number,
    percentage: number
  }>,
  by_district: Array<{
    district: string,
    average_price: number,
    median_price: number,
    count: number
  }>
}
```

## 🤖 Machine Learning Model

### Features (Đặc trưng đầu vào)

1. **Numerical Features:**
   - area (diện tích)
   - rooms (số phòng)
   - toilets (số toilet)
   - floors (số tầng)
   - width, length
   - lat, lng (coordinates)
   - image_count

2. **Categorical Features:**
   - district (one-hot encoding)
   - ward (one-hot encoding hoặc target encoding)
   - legal
   - pty_characteristics

3. **Engineered Features:**
   - price_per_m2_area (từ data tương tự)
   - distance_to_center (khoảng cách đến trung tâm)
   - density_score (mật độ nhà trong khu vực)
   - aspect_ratio (width/length)

### Model Architecture

```python
# Pipeline
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer
from xgboost import XGBRegressor

model = Pipeline([
    ('preprocessor', ColumnTransformer([
        ('num', StandardScaler(), numerical_features),
        ('cat', OneHotEncoder(), categorical_features)
    ])),
    ('regressor', XGBRegressor(
        n_estimators=1000,
        learning_rate=0.01,
        max_depth=7,
        objective='reg:squarederror'
    ))
])
```

### Evaluation Metrics
- RMSE (Root Mean Squared Error)
- MAE (Mean Absolute Error)
- MAPE (Mean Absolute Percentage Error)
- R² Score

## 🚀 Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- Google Maps API Key

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Setup environment variables
cp .env.example .env
# Edit .env file with your configurations

# 5. Import data to SQLite
python scripts/import_data.py

# 6. Train ML model
python scripts/train_model.py

# 7. Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Add your Google Maps API key

# 4. Run development server
npm run dev
```

### Environment Variables

#### Backend `.env`
```env
DATABASE_URL=sqlite:///./house_prices.db
MODEL_PATH=../models/price_predictor.pkl
SCALER_PATH=../models/feature_scaler.pkl
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
DEBUG=True
```

#### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## 📦 Dependencies

### Backend (`requirements.txt`)
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
pandas==2.2.0
numpy==1.26.3
scikit-learn==1.4.0
xgboost==2.0.3
joblib==1.3.2
pydantic==2.5.3
pydantic-settings==2.1.0
python-multipart==0.0.6
python-dotenv==1.0.0
pytest==7.4.4
httpx==0.26.0
```

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "@react-google-maps/api": "^2.19.3",
    "@mui/material": "^5.15.4",
    "@mui/icons-material": "^5.15.4",
    "@emotion/react": "^11.11.3",
    "@emotion/styled": "^11.11.0",
    "recharts": "^2.10.4",
    "axios": "^1.6.5",
    "@tanstack/react-query": "^5.17.9",
    "zustand": "^4.4.7",
    "date-fns": "^3.1.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.11"
  }
}
```

## 🎨 UI/UX Design

### Layout
- **Header**: Logo, Navigation menu, User info
- **Sidebar**: Filters panel (collapsible on mobile)
- **Main Content**:
  - Tab 1: Price Map (full width)
  - Tab 2: Dashboard (grid layout)
  - Tab 3: Price Prediction (centered form)

### Color Scheme
- Primary: #1976d2 (Blue)
- Secondary: #dc004e (Pink)
- Success: #4caf50 (Green)
- Warning: #ff9800 (Orange)
- Error: #f44336 (Red)

### Responsive Design
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

## 🔒 Security Considerations

1. **Input Validation**: Validate all user inputs with Pydantic
2. **SQL Injection**: Use SQLAlchemy ORM (parameterized queries)
3. **CORS**: Configure proper CORS origins
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **API Key Protection**: Keep Google Maps API key secure (HTTP referrer restrictions)
6. **Environment Variables**: Never commit .env files

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app

# Frontend tests
cd frontend
npm run test
```

## 🔧 Backend Requirements

Frontend đã hoàn thành và sẵn sàng kết nối. Backend cần implement các API sau:

### API Endpoints Cần Thiết

Xem chi tiết trong `frontend/BACKEND_API.md`

**Tóm tắt:**

1. **GET `/api/v1/houses`** - Danh sách nhà với pagination & filters
   - Query: `page`, `limit`, `min_price`, `max_price`, `district`, etc.
   - Response: `{data, total, page, limit, pages}`

2. **GET `/api/v1/houses/{id}`** - Chi tiết một căn nhà

3. **GET `/api/v1/houses/map`** - Dữ liệu cho bản đồ (optimized)
   - Response: `{markers: [{id, lat, lng, price, title, area, image_thumb, price_category}]}`

4. **GET `/api/v1/stats/overview`** - Thống kê tổng quan
   - Response: `{total_houses, average_price, median_price, price_range, ...}`

5. **GET `/api/v1/stats/price-distribution`** - Phân bố giá
   - Response: `{histogram, by_district}`

6. **POST `/api/v1/predict`** - Dự đoán giá (ML model)
   - Request: `{area, rooms, toilets, floors, district, ward, lat, lng, ...}`
   - Response: `{predicted_price, confidence_interval, similar_houses, price_per_m2}`

7. **GET `/api/v1/filters/districts`** - Danh sách quận

8. **GET `/api/v1/filters/wards?district=...`** - Danh sách phường

### Database

- Import `complete_house_dataset.csv` vào SQLite
- Schema chi tiết xem `frontend/BACKEND_API.md`
- Tạo indexes cho performance

### Machine Learning

- Train model với features: area, rooms, toilets, floors, district, ward, lat, lng
- Suggested: XGBoost Regressor hoặc LightGBM
- Save model: `models/price_predictor.pkl`
- Confidence interval: ±15% của predicted price

### CORS

Enable CORS cho `http://localhost:5173`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Kết nối Frontend

Sau khi backend ready:
1. Update `frontend/src/services/api.ts` - thay mock bằng fetch/axios
2. Set `VITE_API_BASE_URL=http://localhost:8000/api/v1` trong `.env`
3. Restart frontend dev server

## 📈 Future Enhancements

- [ ] Kết nối backend API thực tế
- [ ] User authentication & authorization
- [ ] Save favorite houses
- [ ] Price alerts & notifications
- [ ] Advanced filtering (commute time, schools nearby)
- [ ] Clustering markers trên map
- [ ] Search box trên map
- [ ] Mobile app (React Native)
- [ ] Real-time data updates (WebSocket)
- [ ] Integration with more data sources
- [ ] A/B testing different ML models
- [ ] Deployment to cloud (AWS, GCP, Azure)

## 📝 License

MIT License

## 👥 Contributors

- [Your Name] - Initial work

## 📞 Contact

- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

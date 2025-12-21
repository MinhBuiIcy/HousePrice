# House ML API

FastAPI service để expose ML models (Price Prediction + Recommendation).

API **load pre-trained models** từ notebooks (không train lại), siêu nhanh!

## Setup

### Bước 1: Train và Save Models

Chạy 2 notebooks để train và save models:
1. `01_house_price_prediction.ipynb` - Run cell "Save Models cho API"
2. `02_house_recommendation_system.ipynb` - Run cell "Save Models cho API"

Models sẽ được lưu vào folder `models/`:
- price_prediction_model.pkl
- price_prediction_scaler.pkl
- recommendation_knn.pkl
- recommendation_df.pkl
- ...

### Bước 2: Install Dependencies

```bash
pip install fastapi uvicorn scikit-learn pandas numpy joblib
```

### Bước 3: Run API

```bash
python ml_api.py
```

hoặc

```bash
uvicorn ml_api:app --host 0.0.0.0 --port 8001 --reload
```

API sẽ chạy tại: `http://localhost:8001`

**Output khi start:**
```
================================================================================
LOADING PRE-TRAINED MODELS
================================================================================

--- Loading Price Prediction Models ---
Model loaded: RandomForestRegressor
Features: 24

--- Loading Recommendation Models ---
KNN loaded with 14,415 houses
Features: 17

================================================================================
ALL MODELS LOADED SUCCESSFULLY
================================================================================
```

## Endpoints

### Health Check
- **GET** `/health` - Kiểm tra trạng thái API

### Price Prediction
- **POST** `/predict` - Dự đoán giá nhà

**Request body:**
```json
{
  "area": 80,
  "rooms": 3,
  "toilets": 2,
  "floors": 4,
  "district": "Quận Hoàn Kiếm",
  "lat": 21.028,
  "lng": 105.854
}
```

**Response:**
```json
{
  "success": true,
  "predicted_price": 5000000000,
  "predicted_price_billions": 5.0
}
```

### Recommendation

#### 1. Gợi ý theo House ID
- **GET** `/recommend/by-id/{house_id}?limit=5`

**Response:**
```json
{
  "success": true,
  "original_house_id": 100,
  "recommendations": [
    {
      "rank": 1,
      "similarity_score": 0.95,
      "price": 5000000000,
      "area": 80,
      "district": "Quận Hoàn Kiếm",
      "title": "Nhà đẹp..."
    }
  ]
}
```

#### 2. Gợi ý theo Features
- **POST** `/recommend/by-features`

**Request body:**
```json
{
  "price": 5000000000,
  "area": 80,
  "rooms": 3,
  "toilets": 2,
  "floors": 4,
  "district": "Quận Hoàn Kiếm",
  "n_recommendations": 5
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [...]
}
```

## Backend Integration

Backend (Node.js) có thể gọi API này:

```javascript
// Predict price
const response = await axios.post('http://localhost:8001/predict', {
  area: 80,
  rooms: 3,
  district: "Quận Hoàn Kiếm"
});
const predictedPrice = response.data.predicted_price;

// Get recommendations by ID
const recs = await axios.get('http://localhost:8001/recommend/by-id/100?limit=5');

// Get recommendations by features
const recs2 = await axios.post('http://localhost:8001/recommend/by-features', {
  price: 5000000000,
  area: 80,
  district: "Quận Hoàn Kiếm"
});
```

## Notes

- API tự động load data và train models khi khởi động
- Models được train in-memory (không lưu file)
- Ưu tiên load `data/cleaned_house_dataset.csv`, fallback về `data/complete_house_dataset.csv`
- District bonus: +0.15 cho nhà cùng quận

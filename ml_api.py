"""
FastAPI service cho House Price Prediction và Recommendation
Load pre-trained models từ notebooks (không train lại)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import numpy as np
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

app = FastAPI(title="House ML API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# GLOBAL VARIABLES
# ============================================================================
prediction_model = None
prediction_scaler = None
prediction_features = None
prediction_encoders = None

recommendation_knn = None
recommendation_scaler = None
recommendation_X_scaled = None
recommendation_df = None
recommendation_features = None
recommendation_encoders = None

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class PredictRequest(BaseModel):
    area: float
    rooms: Optional[float] = None
    toilets: Optional[float] = None
    floors: Optional[float] = None
    width: Optional[float] = None
    length: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    district: Optional[str] = None
    ward: Optional[str] = None
    legal: Optional[str] = None
    seller_type: Optional[str] = None

class RecommendByFeaturesRequest(BaseModel):
    price: float
    area: float
    rooms: Optional[float] = None
    toilets: Optional[float] = None
    floors: Optional[float] = None
    district: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    n_recommendations: Optional[int] = 5

# ============================================================================
# STARTUP - Load Pre-trained Models
# ============================================================================

@app.on_event("startup")
async def load_models():
    """Load pre-trained models từ notebooks"""
    global prediction_model, prediction_scaler, prediction_features, prediction_encoders
    global recommendation_knn, recommendation_scaler, recommendation_X_scaled
    global recommendation_df, recommendation_features, recommendation_encoders
    
    print("=" * 80)
    print("LOADING PRE-TRAINED MODELS")
    print("=" * 80)
    
    models_dir = 'models'
    if not os.path.exists(models_dir):
        raise Exception(f"Models directory not found: {models_dir}\nPlease run notebooks to save models first!")
    
    try:
        # Load Price Prediction Models
        print("\n--- Loading Price Prediction Models ---")
        prediction_model = joblib.load(f'{models_dir}/price_prediction_model.pkl')
        prediction_scaler = joblib.load(f'{models_dir}/price_prediction_scaler.pkl')
        prediction_features = joblib.load(f'{models_dir}/price_prediction_features.pkl')
        prediction_encoders = joblib.load(f'{models_dir}/price_prediction_encoders.pkl')
        print(f"Model loaded: {type(prediction_model).__name__}")
        print(f"Features: {len(prediction_features)}")
        
        # Load Recommendation Models
        print("\n--- Loading Recommendation Models ---")
        recommendation_knn = joblib.load(f'{models_dir}/recommendation_knn.pkl')
        recommendation_scaler = joblib.load(f'{models_dir}/recommendation_scaler.pkl')
        recommendation_X_scaled = joblib.load(f'{models_dir}/recommendation_X_scaled.pkl')
        recommendation_df = joblib.load(f'{models_dir}/recommendation_df.pkl')
        recommendation_features = joblib.load(f'{models_dir}/recommendation_features.pkl')
        recommendation_encoders = joblib.load(f'{models_dir}/recommendation_encoders.pkl')
        print(f"KNN loaded with {recommendation_X_scaled.shape[0]:,} houses")
        print(f"Features: {len(recommendation_features)}")
        
        print("\n" + "=" * 80)
        print("ALL MODELS LOADED SUCCESSFULLY")
        print("=" * 80)
        
    except Exception as e:
        print(f"\nERROR loading models: {str(e)}")
        print("Please run the notebooks and execute the save models cells first!")
        raise

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/")
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "House ML API",
        "models": {
            "prediction": prediction_model is not None,
            "recommendation": recommendation_knn is not None
        },
        "data": {
            "total_houses": len(recommendation_df) if recommendation_df is not None else 0
        }
    }

# ============================================================================
# PRICE PREDICTION ENDPOINTS
# ============================================================================

@app.post("/predict")
async def predict_price(request: PredictRequest):
    """
    Dự đoán giá nhà dựa trên features
    
    Returns: predicted_price (VNĐ)
    """
    if prediction_model is None:
        raise HTTPException(status_code=500, detail="Prediction model not loaded")
    
    try:
        # Get default values from data
        default_rooms = recommendation_df['rooms'].median()
        default_toilets = recommendation_df['toilets'].median()
        default_floors = recommendation_df['floors'].median()
        default_width = recommendation_df['width'].median()
        default_length = recommendation_df['length'].median()
        
        # Prepare input data
        data = {
            'area': request.area,
            'rooms': request.rooms if request.rooms is not None else default_rooms,
            'toilets': request.toilets if request.toilets is not None else default_toilets,
            'floors': request.floors if request.floors is not None else default_floors,
            'width': request.width if request.width is not None else default_width,
            'length': request.length if request.length is not None else default_length,
            'lat': request.lat if request.lat is not None else 21.0285,
            'lng': request.lng if request.lng is not None else 105.8542,
        }
        
        # Engineered features
        data['total_rooms'] = data['rooms'] + data['toilets']
        data['area_per_floor'] = data['area'] / (data['floors'] + 0.1)
        data['room_density'] = data['total_rooms'] / (data['area'] + 1)
        data['width_length_ratio'] = data['width'] / (data['length'] + 0.1)
        
        center_lat, center_lng = 21.0285, 105.8542
        data['distance_from_center'] = np.sqrt((data['lat'] - center_lat)**2 + (data['lng'] - center_lng)**2)
        data['is_central'] = 1 if data['distance_from_center'] < 0.05 else 0
        data['lat_lng_interaction'] = data['lat'] * data['lng']
        
        # Categorical features
        data['district'] = request.district if request.district else 'Unknown'
        data['ward'] = request.ward if request.ward else 'Unknown'
        data['legal'] = request.legal if request.legal else 'Unknown'
        data['seller_type'] = request.seller_type if request.seller_type else 'Unknown'
        
        # Create dataframe
        input_df = pd.DataFrame([data])
        
        # Encode categorical using saved encoders
        input_encoded = pd.get_dummies(input_df, columns=['district', 'ward', 'legal', 'seller_type'], drop_first=True)
        
        # Align with training features
        for col in prediction_features:
            if col not in input_encoded.columns:
                input_encoded[col] = 0
        
        input_encoded = input_encoded[prediction_features]
        
        # Scale
        input_scaled = prediction_scaler.transform(input_encoded)
        
        # Predict
        predicted_price = prediction_model.predict(input_scaled)[0]
        
        return {
            "success": True,
            "predicted_price": float(predicted_price),
            "predicted_price_billions": round(float(predicted_price / 1e9), 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# ============================================================================
# RECOMMENDATION ENDPOINTS
# ============================================================================

@app.get("/recommend/by-id/{house_id}")
async def recommend_by_house_id(house_id: int, limit: int = 5):
    """
    Gợi ý nhà tương tự dựa trên house ID
    
    Returns: list of similar houses
    """
    if recommendation_knn is None or recommendation_X_scaled is None:
        raise HTTPException(status_code=500, detail="Recommendation model not loaded")
    
    if house_id >= len(recommendation_X_scaled) or house_id < 0:
        raise HTTPException(status_code=404, detail="House ID not found")
    
    try:
        # Get features
        house_features = recommendation_X_scaled[house_id].reshape(1, -1)
        
        # Find neighbors
        distances, indices = recommendation_knn.kneighbors(house_features, n_neighbors=limit+1)
        
        # Remove itself
        indices = indices[0][1:]
        distances = distances[0][1:]
        similarity_scores = 1 - distances
        
        # Get house info
        recommendations = []
        for i, idx in enumerate(indices):
            house = recommendation_df.iloc[idx]
            recommendations.append({
                "rank": i + 1,
                "similarity_score": round(float(similarity_scores[i]), 4),
                "price": float(house['price']),
                "price_billions": round(float(house['price'] / 1e9), 2),
                "area": float(house['area']),
                "rooms": int(house['rooms']) if pd.notna(house['rooms']) else None,
                "toilets": int(house['toilets']) if pd.notna(house['toilets']) else None,
                "floors": int(house['floors']) if pd.notna(house['floors']) else None,
                "district": str(house.get('district', '')),
                "ward": str(house.get('ward', '')),
                "title": str(house.get('title', ''))[:100],
                "lat": float(house['lat']) if pd.notna(house['lat']) else None,
                "lng": float(house['lng']) if pd.notna(house['lng']) else None,
            })
        
        return {
            "success": True,
            "original_house_id": house_id,
            "recommendations": recommendations
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

@app.post("/recommend/by-features")
async def recommend_by_features(request: RecommendByFeaturesRequest):
    """
    Gợi ý nhà dựa trên features người dùng nhập
    
    Returns: list of recommended houses
    """
    if recommendation_knn is None or recommendation_scaler is None:
        raise HTTPException(status_code=500, detail="Recommendation model not loaded")
    
    try:
        # Create feature vector
        user_features = {}
        
        user_features['price'] = request.price
        user_features['area'] = request.area
        user_features['price_per_sqm'] = request.price / request.area if request.area > 0 else 0
        
        user_features['rooms'] = request.rooms if request.rooms is not None else recommendation_df['rooms'].median()
        user_features['toilets'] = request.toilets if request.toilets is not None else recommendation_df['toilets'].median()
        user_features['floors'] = request.floors if request.floors is not None else recommendation_df['floors'].median()
        user_features['lat'] = request.lat if request.lat is not None else 21.0285
        user_features['lng'] = request.lng if request.lng is not None else 105.8542
        user_features['width'] = recommendation_df['width'].median()
        user_features['length'] = recommendation_df['length'].median()
        
        user_features['total_rooms'] = user_features['rooms'] + user_features['toilets']
        user_features['area_per_floor'] = request.area / (user_features['floors'] + 0.1)
        center_lat, center_lng = 21.0285, 105.8542
        user_features['distance_from_center'] = np.sqrt(
            (user_features['lat'] - center_lat)**2 + 
            (user_features['lng'] - center_lng)**2
        )
        
        # Price weighting - duplicate price features for higher priority
        user_features['price_weighted'] = user_features['price']
        user_features['price_per_sqm_weighted'] = user_features['price_per_sqm']
        
        # Encode district
        if request.district and 'district' in recommendation_encoders:
            le = recommendation_encoders['district']
            if request.district in le.classes_:
                user_features['district_encoded'] = le.transform([request.district])[0]
            else:
                user_features['district_encoded'] = 0
        else:
            user_features['district_encoded'] = 0
        
        # Fill missing encoded features
        for feat in recommendation_features:
            if feat.endswith('_encoded') and feat not in user_features:
                user_features[feat] = 0
        
        # Create vector in correct order
        user_vector = np.array([user_features.get(f, 0) for f in recommendation_features]).reshape(1, -1)
        user_vector_scaled = recommendation_scaler.transform(user_vector)
        
        # Find neighbors
        distances, indices = recommendation_knn.kneighbors(user_vector_scaled, n_neighbors=request.n_recommendations)
        
        indices = indices[0]
        distances = distances[0]
        similarity_scores = 1 - distances
        
        # Build results
        recommendations = []
        for i, idx in enumerate(indices):
            house = recommendation_df.iloc[idx]
            sim_score = similarity_scores[i]
            
            # District bonus (priority weighting)
            if request.district and house.get('district') == request.district:
                sim_score += 0.15
            
            recommendations.append({
                "rank": i + 1,
                "similarity_score": round(float(sim_score), 4),
                "price": float(house['price']),
                "price_billions": round(float(house['price'] / 1e9), 2),
                "area": float(house['area']),
                "rooms": int(house['rooms']) if pd.notna(house['rooms']) else None,
                "toilets": int(house['toilets']) if pd.notna(house['toilets']) else None,
                "floors": int(house['floors']) if pd.notna(house['floors']) else None,
                "district": str(house.get('district', '')),
                "ward": str(house.get('ward', '')),
                "title": str(house.get('title', ''))[:100],
                "lat": float(house['lat']) if pd.notna(house['lat']) else None,
                "lng": float(house['lng']) if pd.notna(house['lng']) else None,
            })
        
        # Re-sort by adjusted similarity score
        recommendations.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        # Update ranks
        for i, rec in enumerate(recommendations):
            rec['rank'] = i + 1
        
        return {
            "success": True,
            "user_input": {
                "price": request.price,
                "price_billions": round(request.price / 1e9, 2),
                "area": request.area,
                "rooms": request.rooms,
                "district": request.district
            },
            "recommendations": recommendations
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

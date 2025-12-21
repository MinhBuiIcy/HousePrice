"""
Convert scikit-learn .pkl models to ONNX format for Node.js usage

Requirements:
pip install scikit-learn onnx skl2onnx onnxruntime joblib pandas numpy
"""

import joblib
import json
import numpy as np
import pandas as pd
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType, DoubleTensorType
import onnx
import os

def save_json(data, filepath):
    """Save data as JSON"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved: {filepath}")

def convert_model_to_onnx(model, initial_type, output_path):
    """Convert sklearn model to ONNX"""
    try:
        onnx_model = convert_sklearn(model, initial_types=initial_type)
        with open(output_path, "wb") as f:
            f.write(onnx_model.SerializeToString())
        print(f"✓ Converted: {output_path}")
        return True
    except Exception as e:
        print(f"✗ Failed to convert {output_path}: {str(e)}")
        return False

def extract_label_encoders(encoders_dict):
    """Extract LabelEncoder mappings to JSON"""
    result = {}
    for key, encoder in encoders_dict.items():
        if hasattr(encoder, 'classes_'):
            result[key] = {
                'classes': encoder.classes_.tolist()
            }
    return result

def main():
    print("=" * 80)
    print("CONVERTING ML MODELS TO ONNX FORMAT")
    print("=" * 80)

    models_dir = '../models'
    output_dir = '../backend/ml/models'

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # ========================================================================
    # 1. PRICE PREDICTION MODELS
    # ========================================================================
    print("\n--- Converting Price Prediction Models ---")

    try:
        # Load models
        prediction_model = joblib.load(f'{models_dir}/price_prediction_model.pkl')
        prediction_scaler = joblib.load(f'{models_dir}/price_prediction_scaler.pkl')
        prediction_features = joblib.load(f'{models_dir}/price_prediction_features.pkl')
        prediction_encoders = joblib.load(f'{models_dir}/price_prediction_encoders.pkl')

        # Get number of features
        n_features = len(prediction_features)
        print(f"Features count: {n_features}")
        print(f"Model type: {type(prediction_model).__name__}")

        # Convert main prediction model to ONNX
        initial_type = [('float_input', FloatTensorType([None, n_features]))]
        convert_model_to_onnx(
            prediction_model,
            initial_type,
            f'{output_dir}/price_prediction_model.onnx'
        )

        # Convert scaler to ONNX
        convert_model_to_onnx(
            prediction_scaler,
            initial_type,
            f'{output_dir}/price_prediction_scaler.onnx'
        )

        # Save features as JSON
        save_json(prediction_features, f'{output_dir}/price_prediction_features.json')

        # Save encoders as JSON (if not empty)
        if prediction_encoders and len(prediction_encoders) > 0:
            encoders_json = extract_label_encoders(prediction_encoders)
            save_json(encoders_json, f'{output_dir}/price_prediction_encoders.json')
        else:
            print("⚠ Price prediction encoders is empty, skipping")
            save_json({}, f'{output_dir}/price_prediction_encoders.json')

    except Exception as e:
        print(f"✗ Error in price prediction conversion: {str(e)}")

    # ========================================================================
    # 2. RECOMMENDATION MODELS
    # ========================================================================
    print("\n--- Converting Recommendation Models ---")

    try:
        # Load models
        recommendation_knn = joblib.load(f'{models_dir}/recommendation_knn.pkl')
        recommendation_scaler = joblib.load(f'{models_dir}/recommendation_scaler.pkl')
        recommendation_X_scaled = joblib.load(f'{models_dir}/recommendation_X_scaled.pkl')
        recommendation_df = joblib.load(f'{models_dir}/recommendation_df.pkl')
        recommendation_features = joblib.load(f'{models_dir}/recommendation_features.pkl')
        recommendation_encoders = joblib.load(f'{models_dir}/recommendation_encoders.pkl')

        # Get number of features
        n_rec_features = len(recommendation_features)
        print(f"Features count: {n_rec_features}")
        print(f"Total houses: {len(recommendation_df)}")
        print(f"KNN model type: {type(recommendation_knn).__name__}")

        # Convert KNN model to ONNX
        initial_type_rec = [('float_input', FloatTensorType([None, n_rec_features]))]
        convert_model_to_onnx(
            recommendation_knn,
            initial_type_rec,
            f'{output_dir}/recommendation_knn.onnx'
        )

        # Convert scaler to ONNX
        convert_model_to_onnx(
            recommendation_scaler,
            initial_type_rec,
            f'{output_dir}/recommendation_scaler.onnx'
        )

        # Save features as JSON
        save_json(recommendation_features, f'{output_dir}/recommendation_features.json')

        # Save encoders as JSON
        encoders_json = extract_label_encoders(recommendation_encoders)
        save_json(encoders_json, f'{output_dir}/recommendation_encoders.json')

        # Save pre-scaled features as numpy file (more efficient than JSON)
        np.save(f'{output_dir}/recommendation_X_scaled.npy', recommendation_X_scaled)
        print(f"✓ Saved: {output_dir}/recommendation_X_scaled.npy")

        # Save DataFrame as JSON (for house lookup)
        # Select only necessary columns to reduce size
        essential_cols = [
            'price', 'area', 'rooms', 'toilets', 'floors',
            'district', 'ward', 'title', 'lat', 'lng',
            'width', 'length'
        ]
        df_subset = recommendation_df[[col for col in essential_cols if col in recommendation_df.columns]]

        # Convert to JSON-serializable format
        df_dict = df_subset.to_dict(orient='records')
        save_json(df_dict, f'{output_dir}/recommendation_houses.json')

    except Exception as e:
        print(f"✗ Error in recommendation conversion: {str(e)}")

    # ========================================================================
    # 3. CREATE METADATA FILE
    # ========================================================================
    print("\n--- Creating Metadata ---")

    metadata = {
        "conversion_date": pd.Timestamp.now().isoformat(),
        "price_prediction": {
            "model_type": type(prediction_model).__name__,
            "n_features": n_features,
            "features": prediction_features
        },
        "recommendation": {
            "model_type": type(recommendation_knn).__name__,
            "n_features": n_rec_features,
            "n_houses": len(recommendation_df),
            "features": recommendation_features
        }
    }

    save_json(metadata, f'{output_dir}/metadata.json')

    print("\n" + "=" * 80)
    print("CONVERSION COMPLETED!")
    print("=" * 80)
    print(f"\nONNX models saved to: {output_dir}/")
    print("\nNext steps:")
    print("1. Install onnxruntime-node in backend:")
    print("   cd backend && npm install onnxruntime-node")
    print("2. Create ML predictor class in backend/ml/predictor.js")
    print("3. Implement feature engineering in JavaScript")
    print("4. Create /api/v1/predict endpoint")

if __name__ == "__main__":
    main()

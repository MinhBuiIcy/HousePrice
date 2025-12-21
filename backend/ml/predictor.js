/**
 * Node.js ML Predictor cho House Price Prediction và Recommendation
 * Sử dụng ONNX Runtime thay vì Python .pkl models
 */

const ort = require('onnxruntime-node');
const fs = require('fs').promises;
const path = require('path');

class MLPredictor {
  constructor() {
    // ONNX models
    this.predictionModel = null;
    this.predictionScaler = null;

    // Metadata
    this.predictionFeatures = null;
    this.predictionEncoders = null;

    // Recommendation data
    this.recommendationScaler = null;
    this.recommendationXScaled = null;
    this.recommendationHouses = null;
    this.recommendationFeatures = null;
    this.recommendationEncoders = null;

    // Default values
    this.centerLat = 21.0285;
    this.centerLng = 105.8542;

    this.isLoaded = false;
  }

  /**
   * Load tất cả models và data
   */
  async loadModels() {
    console.log('='.repeat(80));
    console.log('LOADING ONNX MODELS');
    console.log('='.repeat(80));

    const modelsDir = path.join(__dirname, 'models');

    try {
      // Load Price Prediction Models
      console.log('\n--- Loading Price Prediction Models ---');
      this.predictionModel = await ort.InferenceSession.create(
        path.join(modelsDir, 'price_prediction_model.onnx')
      );
      this.predictionScaler = await ort.InferenceSession.create(
        path.join(modelsDir, 'price_prediction_scaler.onnx')
      );

      // Load JSON metadata
      this.predictionFeatures = JSON.parse(
        await fs.readFile(path.join(modelsDir, 'price_prediction_features.json'), 'utf8')
      );
      this.predictionEncoders = JSON.parse(
        await fs.readFile(path.join(modelsDir, 'price_prediction_encoders.json'), 'utf8')
      );

      console.log(`✓ Model loaded: RandomForestRegressor`);
      console.log(`✓ Features: ${this.predictionFeatures.length}`);

      // Load Recommendation Models & Data
      console.log('\n--- Loading Recommendation Models ---');
      this.recommendationScaler = await ort.InferenceSession.create(
        path.join(modelsDir, 'recommendation_scaler.onnx')
      );

      this.recommendationFeatures = JSON.parse(
        await fs.readFile(path.join(modelsDir, 'recommendation_features.json'), 'utf8')
      );
      this.recommendationEncoders = JSON.parse(
        await fs.readFile(path.join(modelsDir, 'recommendation_encoders.json'), 'utf8')
      );
      this.recommendationHouses = JSON.parse(
        await fs.readFile(path.join(modelsDir, 'recommendation_houses.json'), 'utf8')
      );

      // Load pre-scaled features (numpy array)
      const numpyData = await this.loadNumpyArray(
        path.join(modelsDir, 'recommendation_X_scaled.npy')
      );
      this.recommendationXScaled = numpyData;

      console.log(`✓ KNN data loaded: ${this.recommendationHouses.length} houses`);
      console.log(`✓ Features: ${this.recommendationFeatures.length}`);

      this.isLoaded = true;

      console.log('\n' + '='.repeat(80));
      console.log('ALL MODELS LOADED SUCCESSFULLY');
      console.log('='.repeat(80));

    } catch (error) {
      console.error('\nERROR loading models:', error.message);
      throw error;
    }
  }

  /**
   * Load numpy .npy file (simple implementation)
   */
  async loadNumpyArray(filePath) {
    const buffer = await fs.readFile(filePath);

    // Parse numpy header (simple version)
    // Skip header and read float64 array
    const headerLen = buffer.readUInt16LE(8) + 10;
    const dataBuffer = buffer.slice(headerLen);

    // Convert to Float32Array for ONNX
    const float64Array = new Float64Array(
      dataBuffer.buffer,
      dataBuffer.byteOffset,
      dataBuffer.byteLength / 8
    );

    // Determine shape from header
    const headerStr = buffer.slice(10, headerLen).toString();
    const shapeMatch = headerStr.match(/'shape':\s*\((\d+),\s*(\d+)\)/);
    const rows = parseInt(shapeMatch[1]);
    const cols = parseInt(shapeMatch[2]);

    // Convert to 2D array
    const array2D = [];
    for (let i = 0; i < rows; i++) {
      const row = Array.from(float64Array.slice(i * cols, (i + 1) * cols));
      array2D.push(row);
    }

    return array2D;
  }

  /**
   * Encode categorical variable using label encoder
   */
  encodeCategorical(value, encoderName) {
    if (!this.recommendationEncoders[encoderName]) {
      return 0;
    }

    const encoder = this.recommendationEncoders[encoderName];
    const index = encoder.classes.indexOf(value);
    return index >= 0 ? index : 0;
  }

  /**
   * Tính toán engineered features cho price prediction
   */
  engineerPredictionFeatures(input) {
    const features = {
      area: input.area,
      rooms: input.rooms || 3,
      toilets: input.toilets || 2,
      floors: input.floors || 4,
      lat: input.lat || this.centerLat,
      lng: input.lng || this.centerLng,
      width: input.width || 4.5,
      length: input.length || 15,
    };

    // Engineered features
    features.total_rooms = features.rooms + features.toilets;
    features.toilet_room_ratio = features.toilets / (features.rooms + 0.1);
    features.area_per_floor = features.area / (features.floors + 0.1);
    features.has_dimensions = (input.width && input.length) ? 1 : 0;

    const distFromCenter = Math.sqrt(
      Math.pow(features.lat - this.centerLat, 2) +
      Math.pow(features.lng - this.centerLng, 2)
    );
    features.distance_from_center = distFromCenter;
    features.width_length_ratio = features.width / (features.length + 0.1);
    features.total_floor_area = features.area * features.floors;
    features.rooms_per_sqm = features.total_rooms / (features.area + 1);

    // Encoded categorical features
    features.district_encoded = this.encodeCategorical(input.district || 'Unknown', 'district');
    features.ward_encoded = this.encodeCategorical(input.ward || 'Unknown', 'ward');
    features.legal_encoded = this.encodeCategorical(input.legal || 'Unknown', 'legal');
    features.seller_type_encoded = this.encodeCategorical(input.seller_type || 'Unknown', 'seller_type');

    // Additional encoded features (use 0 as default)
    features.owner_type_encoded = 0;
    features.city_encoded = 0;
    features.street_encoded = 0;
    features.protection_encoded = 0;

    return features;
  }

  /**
   * Dự đoán giá nhà
   */
  async predictPrice(input) {
    if (!this.isLoaded) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    try {
      // Engineer features
      const features = this.engineerPredictionFeatures(input);

      // Create feature vector theo đúng thứ tự
      const featureVector = this.predictionFeatures.map(name => features[name] || 0);

      // Convert to Float32Array và reshape to [1, n_features]
      const inputTensor = new ort.Tensor('float32', Float32Array.from(featureVector), [1, featureVector.length]);

      // Scale features
      const scalerOutput = await this.predictionScaler.run({ float_input: inputTensor });
      const scaledTensor = scalerOutput[Object.keys(scalerOutput)[0]];

      // Predict
      const modelOutput = await this.predictionModel.run({ float_input: scaledTensor });
      const prediction = modelOutput[Object.keys(modelOutput)[0]].data[0];

      // Calculate confidence interval (85% - 115% of predicted price)
      const confidenceInterval = {
        lower: Math.round(prediction * 0.85),
        upper: Math.round(prediction * 1.15)
      };

      // Calculate price per m2
      const pricePerM2 = Math.round(prediction / features.area);

      // Find similar houses based on area, rooms, and district
      const similarHouses = this.findSimilarHouses(features, 3);

      return {
        success: true,
        predicted_price: prediction,
        predicted_price_billions: Math.round(prediction / 1e9 * 100) / 100,
        confidence_interval: confidenceInterval,
        price_per_m2: pricePerM2,
        similar_houses: similarHouses
      };

    } catch (error) {
      throw new Error(`Prediction error: ${error.message}`);
    }
  }

  /**
   * Find similar houses based on features
   */
  findSimilarHouses(features, limit = 3) {
    if (!this.recommendationHouses || this.recommendationHouses.length === 0) {
      return [];
    }

    // Filter houses with similar area (+/- 30m2) and same district
    const candidates = this.recommendationHouses.filter(house => {
      const areaDiff = Math.abs(house.area - features.area);
      const sameDistrict = features.district && house.district === features.district;
      return areaDiff <= 30 && sameDistrict;
    });

    // If not enough with same district, expand search
    if (candidates.length < limit) {
      const moreCandidates = this.recommendationHouses.filter(house => {
        const areaDiff = Math.abs(house.area - features.area);
        return areaDiff <= 50;
      });
      candidates.push(...moreCandidates);
    }

    // Sort by area similarity and price
    candidates.sort((a, b) => {
      const aDiff = Math.abs(a.area - features.area);
      const bDiff = Math.abs(b.area - features.area);
      return aDiff - bDiff;
    });

    // Return top N with distance calculation
    return candidates.slice(0, limit).map(house => ({
      id: house.id,
      price: house.price,
      area: house.area,
      rooms: house.rooms,
      district: house.district,
      ward: house.ward,
      title: house.title,
      distance_km: this.calculateDistance(features.lat, features.lng, house.lat, house.lng)
    }));
  }

  /**
   * Calculate distance between two lat/lng points (Haversine formula)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 0;
    
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
  }

  /**
   * Tính khoảng cách Euclidean giữa 2 vectors
   */
  euclideanDistance(vec1, vec2) {
    let sum = 0;
    for (let i = 0; i < vec1.length; i++) {
      const diff = vec1[i] - vec2[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  /**
   * KNN implementation in pure JavaScript
   */
  findKNearestNeighbors(queryVector, k) {
    const distances = [];

    for (let i = 0; i < this.recommendationXScaled.length; i++) {
      const distance = this.euclideanDistance(queryVector, this.recommendationXScaled[i]);
      distances.push({ index: i, distance });
    }

    // Sort by distance và lấy k nearest
    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, k);
  }

  /**
   * Gợi ý nhà theo house ID
   */
  async recommendByHouseId(houseId, limit = 5) {
    if (!this.isLoaded) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    if (houseId >= this.recommendationXScaled.length || houseId < 0) {
      throw new Error('House ID not found');
    }

    try {
      const houseFeatures = this.recommendationXScaled[houseId];
      const neighbors = this.findKNearestNeighbors(houseFeatures, limit + 1);

      // Remove first item (itself)
      const recommendations = neighbors.slice(1).map((neighbor, i) => {
        const house = this.recommendationHouses[neighbor.index];
        const similarityScore = 1 - neighbor.distance;

        return {
          rank: i + 1,
          similarity_score: Math.round(similarityScore * 10000) / 10000,
          price: house.price,
          price_billions: Math.round(house.price / 1e9 * 100) / 100,
          area: house.area,
          rooms: house.rooms,
          toilets: house.toilets,
          floors: house.floors,
          district: house.district || '',
          ward: house.ward || '',
          title: (house.title || '').substring(0, 100),
          lat: house.lat,
          lng: house.lng
        };
      });

      return {
        success: true,
        original_house_id: houseId,
        recommendations
      };

    } catch (error) {
      throw new Error(`Recommendation error: ${error.message}`);
    }
  }

  /**
   * Tính toán features cho recommendation
   */
  engineerRecommendationFeatures(input) {
    const features = {};

    features.price = input.price;
    features.area = input.area;
    features.price_per_sqm = input.price / input.area;

    features.rooms = input.rooms || 3;
    features.toilets = input.toilets || 2;
    features.floors = input.floors || 4;
    features.lat = input.lat || this.centerLat;
    features.lng = input.lng || this.centerLng;
    features.width = input.width || 4.5;
    features.length = input.length || 15;

    features.total_rooms = features.rooms + features.toilets;
    features.area_per_floor = features.area / (features.floors + 0.1);

    const distFromCenter = Math.sqrt(
      Math.pow(features.lat - this.centerLat, 2) +
      Math.pow(features.lng - this.centerLng, 2)
    );
    features.distance_from_center = distFromCenter;

    // Encoded features
    features.district_encoded = this.encodeCategorical(input.district || 'Unknown', 'district');
    features.ward_encoded = this.encodeCategorical(input.ward || 'Unknown', 'ward');
    features.legal_encoded = this.encodeCategorical(input.legal || 'Unknown', 'legal');
    features.seller_type_encoded = this.encodeCategorical(input.seller_type || 'Unknown', 'seller_type');

    return features;
  }

  /**
   * Gợi ý nhà theo features
   */
  async recommendByFeatures(input) {
    if (!this.isLoaded) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    try {
      const features = this.engineerRecommendationFeatures(input);

      // Create feature vector theo đúng thứ tự
      const featureVector = this.recommendationFeatures.map(name => features[name] || 0);

      // Scale features
      const inputTensor = new ort.Tensor('float32', Float32Array.from(featureVector), [1, featureVector.length]);
      const scalerOutput = await this.recommendationScaler.run({ float_input: inputTensor });
      const scaledData = Array.from(scalerOutput[Object.keys(scalerOutput)[0]].data);

      // Find neighbors
      const limit = input.n_recommendations || 5;
      const neighbors = this.findKNearestNeighbors(scaledData, limit);

      const recommendations = neighbors.map((neighbor, i) => {
        const house = this.recommendationHouses[neighbor.index];
        let similarityScore = 1 - neighbor.distance;

        // District bonus
        if (input.district && house.district === input.district) {
          similarityScore += 0.15;
        }

        return {
          rank: i + 1,
          similarity_score: Math.round(similarityScore * 10000) / 10000,
          price: house.price,
          price_billions: Math.round(house.price / 1e9 * 100) / 100,
          area: house.area,
          rooms: house.rooms,
          toilets: house.toilets,
          floors: house.floors,
          district: house.district || '',
          ward: house.ward || '',
          title: (house.title || '').substring(0, 100),
          lat: house.lat,
          lng: house.lng
        };
      });

      // Re-sort by adjusted similarity score
      recommendations.sort((a, b) => b.similarity_score - a.similarity_score);

      // Update ranks
      recommendations.forEach((rec, i) => {
        rec.rank = i + 1;
      });

      return {
        success: true,
        user_input: {
          price: input.price,
          price_billions: Math.round(input.price / 1e9 * 100) / 100,
          area: input.area,
          rooms: input.rooms,
          district: input.district
        },
        recommendations
      };

    } catch (error) {
      throw new Error(`Recommendation error: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  getStatus() {
    return {
      status: this.isLoaded ? 'healthy' : 'not loaded',
      service: 'House ML API (Node.js)',
      models: {
        prediction: this.predictionModel !== null,
        recommendation: this.recommendationHouses !== null
      },
      data: {
        total_houses: this.recommendationHouses ? this.recommendationHouses.length : 0
      }
    };
  }
}

// Export singleton instance
const predictor = new MLPredictor();

module.exports = predictor;

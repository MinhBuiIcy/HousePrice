import axios from 'axios';
import {
  House,
  MapMarker,
  HouseFilters,
  StatsOverview,
  PriceDistribution,
  PredictionRequest,
  PredictionResult,
} from '../types/house';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Real API Service
class RealAPIService {
  // Get all houses with filters
  async getHouses(filters?: HouseFilters, page = 1, limit = 20): Promise<{
    data: House[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const params: any = { page, limit };

    if (filters) {
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.min_area) params.min_area = filters.min_area;
      if (filters.max_area) params.max_area = filters.max_area;
      if (filters.district) params.district = filters.district;
      if (filters.ward) params.ward = filters.ward;
      if (filters.min_rooms) params.min_rooms = filters.min_rooms;
    }

    const response = await axiosInstance.get('/houses', { params });
    return response.data.data || { data: [], total: 0, page: 1, limit: 20, pages: 0 };
  }

  // Get house by ID
  async getHouseById(id: number): Promise<House | null> {
    try {
      const response = await axiosInstance.get(`/houses/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching house:', error);
      return null;
    }
  }

  // Get map markers
  async getMapMarkers(filters?: HouseFilters): Promise<MapMarker[]> {
    const params: any = {};

    if (filters) {
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.district) params.district = filters.district;
    }

    const response = await axiosInstance.get('/houses/map', { params });
    // Backend returns { success: true, data: { markers: [...] } }
    return response.data.data.markers || [];
  }

  // Get stats overview
  async getStatsOverview(): Promise<StatsOverview> {
    const response = await axiosInstance.get('/stats/overview');
    return response.data.data || {};
  }

  // Get price distribution
  async getPriceDistribution(): Promise<PriceDistribution> {
    const response = await axiosInstance.get('/stats/price-distribution');
    return response.data.data || { histogram: [], by_district: [] };
  }

  // Predict price using ML model
  async predictPrice(request: PredictionRequest): Promise<PredictionResult> {
    const response = await axiosInstance.post('/ml/predict', request);
    // ML API returns direct prediction result
    const result = response.data.data;
    return {
      predicted_price: result.predicted_price,
      confidence_interval: result.confidence_interval || { lower: 0, upper: 0 },
      similar_houses: result.similar_houses || [],
      price_per_m2: result.predicted_price / request.area,
      prediction_id: Date.now(),
    };
  }

  // Get house recommendations using ML model
  async recommendHouses(request: PredictionRequest): Promise<House[]> {
    const response = await axiosInstance.post('/ml/recommend', request);
    // ML recommendation API returns { recommendations: [...] }
    return response.data.data?.recommendations || [];
  }

  // Get unique districts
  async getDistricts(): Promise<string[]> {
    const response = await axiosInstance.get('/filters/districts');
    return response.data.data?.districts || [];
  }

  // Get wards by district
  async getWards(district: string): Promise<string[]> {
    const response = await axiosInstance.get('/filters/wards', {
      params: { district },
    });
    return response.data.data?.wards || [];
  }
}

export const realApi = new RealAPIService();

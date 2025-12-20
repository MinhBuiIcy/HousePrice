import {
  House,
  MapMarker,
  HouseFilters,
  StatsOverview,
  PriceDistribution,
  PredictionRequest,
  PredictionResult,
} from '../types/house';
import { mockHouses } from '../data/mockHouses';

// Helper function to categorize price
const getPriceCategory = (price: number): 'low' | 'medium' | 'high' | 'very_high' => {
  if (price < 5000000000) return 'low';
  if (price < 10000000000) return 'medium';
  if (price < 20000000000) return 'high';
  return 'very_high';
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API Service
class MockAPIService {
  // Get all houses with filters
  async getHouses(filters?: HouseFilters, page = 1, limit = 20): Promise<{
    data: House[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    await delay(500); // Simulate network delay

    let filtered = [...mockHouses];

    // Apply filters
    if (filters) {
      if (filters.min_price) {
        filtered = filtered.filter(h => h.price >= filters.min_price!);
      }
      if (filters.max_price) {
        filtered = filtered.filter(h => h.price <= filters.max_price!);
      }
      if (filters.min_area && filters.min_area > 0) {
        filtered = filtered.filter(h => h.area && h.area >= filters.min_area!);
      }
      if (filters.max_area && filters.max_area > 0) {
        filtered = filtered.filter(h => h.area && h.area <= filters.max_area!);
      }
      if (filters.district) {
        filtered = filtered.filter(h => h.district === filters.district);
      }
      if (filters.ward) {
        filtered = filtered.filter(h => h.ward === filters.ward);
      }
      if (filters.min_rooms && filters.min_rooms > 0) {
        filtered = filtered.filter(h => h.rooms && h.rooms >= filters.min_rooms!);
      }
    }

    const total = filtered.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = filtered.slice(start, end);

    return { data, total, page, limit, pages };
  }

  // Get house by ID
  async getHouseById(id: number): Promise<House | null> {
    await delay(300);
    return mockHouses.find(h => h.id === id) || null;
  }

  // Get map markers
  async getMapMarkers(filters?: HouseFilters): Promise<MapMarker[]> {
    await delay(400);

    let filtered = [...mockHouses];

    // Apply filters
    if (filters) {
      if (filters.min_price) {
        filtered = filtered.filter(h => h.price >= filters.min_price!);
      }
      if (filters.max_price) {
        filtered = filtered.filter(h => h.price <= filters.max_price!);
      }
      if (filters.district) {
        filtered = filtered.filter(h => h.district === filters.district);
      }
    }

    return filtered.map(house => ({
      id: house.id,
      lat: house.lat,
      lng: house.lng,
      price: house.price,
      title: house.title,
      area: house.area,
      image_thumb: house.image_thumb,
      price_category: getPriceCategory(house.price),
    }));
  }

  // Get statistics overview
  async getStatsOverview(): Promise<StatsOverview> {
    await delay(400);

    const prices = mockHouses.map(h => h.price);
    const areas = mockHouses.filter(h => h.area).map(h => h.area!);

    const sortedPrices = [...prices].sort((a, b) => a - b);
    const median = sortedPrices[Math.floor(sortedPrices.length / 2)];

    // Calculate average price by district
    const districtPrices: { [key: string]: number[] } = {};
    mockHouses.forEach(h => {
      if (!districtPrices[h.district]) {
        districtPrices[h.district] = [];
      }
      districtPrices[h.district].push(h.price);
    });

    const districtAvgs = Object.entries(districtPrices).map(([district, prices]) => ({
      district,
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
    }));

    districtAvgs.sort((a, b) => b.avg - a.avg);

    return {
      total_houses: mockHouses.length,
      average_price: prices.reduce((a, b) => a + b, 0) / prices.length,
      median_price: median,
      average_area: areas.reduce((a, b) => a + b, 0) / areas.length,
      price_range: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
      most_expensive_district: districtAvgs[0].district,
      most_affordable_district: districtAvgs[districtAvgs.length - 1].district,
      total_value: prices.reduce((a, b) => a + b, 0),
    };
  }

  // Get price distribution
  async getPriceDistribution(): Promise<PriceDistribution> {
    await delay(400);

    // Create histogram
    const ranges = [
      { range: '0-2 tỷ', min: 0, max: 2000000000 },
      { range: '2-5 tỷ', min: 2000000000, max: 5000000000 },
      { range: '5-10 tỷ', min: 5000000000, max: 10000000000 },
      { range: '10-20 tỷ', min: 10000000000, max: 20000000000 },
      { range: '20-50 tỷ', min: 20000000000, max: 50000000000 },
    ];

    const histogram = ranges.map(r => {
      const count = mockHouses.filter(h => h.price >= r.min && h.price < r.max).length;
      return {
        range: r.range,
        count,
        percentage: (count / mockHouses.length) * 100,
      };
    });

    // Calculate by district
    const districtStats: { [key: string]: number[] } = {};
    mockHouses.forEach(h => {
      if (!districtStats[h.district]) {
        districtStats[h.district] = [];
      }
      districtStats[h.district].push(h.price);
    });

    const by_district = Object.entries(districtStats).map(([district, prices]) => {
      const sorted = [...prices].sort((a, b) => a - b);
      return {
        district,
        average_price: prices.reduce((a, b) => a + b, 0) / prices.length,
        median_price: sorted[Math.floor(sorted.length / 2)],
        count: prices.length,
      };
    });

    return { histogram, by_district };
  }

  // Predict price
  async predictPrice(request: PredictionRequest): Promise<PredictionResult> {
    await delay(800);

    // Simple mock prediction based on area
    const pricePerM2 = 140000000; // ~140M VND per m2
    const basePrice = request.area * pricePerM2;

    // Adjust for rooms, floors, etc.
    let adjustedPrice = basePrice;
    if (request.rooms) adjustedPrice *= (1 + request.rooms * 0.05);
    if (request.floors) adjustedPrice *= (1 + request.floors * 0.03);

    // Add some randomness
    const variance = 0.15;
    const predicted_price = adjustedPrice * (1 + (Math.random() - 0.5) * variance);

    // Find similar houses
    const similar_houses = mockHouses
      .filter(h => h.area && Math.abs(h.area - request.area) < 30)
      .slice(0, 3)
      .map(h => ({
        id: h.id,
        price: h.price,
        area: h.area!,
        distance_km: Math.random() * 5, // Mock distance
      }));

    return {
      predicted_price,
      confidence_interval: {
        lower: predicted_price * 0.85,
        upper: predicted_price * 1.15,
      },
      similar_houses,
      price_per_m2: predicted_price / request.area,
      prediction_id: Date.now(),
    };
  }

  // Get unique districts
  async getDistricts(): Promise<string[]> {
    await delay(200);
    const districts = [...new Set(mockHouses.map(h => h.district))];
    return districts.sort();
  }

  // Get wards by district
  async getWards(district: string): Promise<string[]> {
    await delay(200);
    const wards = [...new Set(
      mockHouses
        .filter(h => h.district === district)
        .map(h => h.ward)
    )];
    return wards.sort();
  }
}

export const api = new MockAPIService();

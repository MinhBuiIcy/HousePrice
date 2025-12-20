export interface House {
  id: number;
  title: string;
  price: number;
  area: number | null;
  date: number;
  city: string;
  district: string;
  ward: string;
  street: string;
  lat: number;
  lng: number;
  body: string;
  rooms: number | null;
  toilets: number | null;
  floors: number | null;
  legal: number | null;
  seller_type: boolean;
  protection: boolean;
  image_count: number;
  image_thumb: string;
  width: number | null;
  length: number | null;
  pty_characteristics: string;
  owner_type: boolean | null;
  is_pro: boolean;
  verified: boolean;
  page: number;
  dateFormatted: string;
}

export interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  price: number;
  title: string;
  area: number | null;
  image_thumb: string;
  price_category: 'low' | 'medium' | 'high' | 'very_high';
}

export interface HouseFilters {
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  city?: string;
  district?: string;
  ward?: string;
  min_rooms?: number;
  max_rooms?: number;
}

export interface StatsOverview {
  total_houses: number;
  average_price: number;
  median_price: number;
  average_area: number;
  price_range: {
    min: number;
    max: number;
  };
  most_expensive_district: string;
  most_affordable_district: string;
  total_value: number;
}

export interface PriceDistribution {
  histogram: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  by_district: Array<{
    district: string;
    average_price: number;
    median_price: number;
    count: number;
  }>;
}

export interface PredictionRequest {
  area: number;
  rooms?: number;
  toilets?: number;
  floors?: number;
  district?: string;
  ward?: string;
  lat?: number;
  lng?: number;
  width?: number;
  length?: number;
  legal?: number;
}

export interface PredictionResult {
  predicted_price: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  similar_houses: Array<{
    id: number;
    price: number;
    area: number;
    distance_km: number;
  }>;
  price_per_m2: number;
  prediction_id: number;
}

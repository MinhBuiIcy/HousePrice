// Format price in Vietnamese currency
export const formatPrice = (price: number): string => {
  if (price >= 1000000000) {
    const billions = price / 1000000000;
    return `${billions.toFixed(2)} tỷ`;
  } else if (price >= 1000000) {
    const millions = price / 1000000;
    return `${millions.toFixed(0)} triệu`;
  }
  return price.toLocaleString('vi-VN') + ' VNĐ';
};

// Format area
export const formatArea = (area: number | null): string => {
  if (!area) return 'N/A';
  return `${area.toFixed(1)} m²`;
};

// Format date
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('vi-VN');
};

// Get marker color based on price category
export const getMarkerColor = (
  category: 'low' | 'medium' | 'high' | 'very_high'
): string => {
  const colors = {
    low: '#4caf50',     // Green
    medium: '#ffeb3b',  // Yellow
    high: '#ff9800',    // Orange
    very_high: '#f44336', // Red
  };
  return colors[category];
};

// Format number with locale
export const formatNumber = (num: number): string => {
  return num.toLocaleString('vi-VN');
};

// Calculate price per m2
export const calculatePricePerM2 = (price: number, area: number | null): string => {
  if (!area || area === 0) return 'N/A';
  const pricePerM2 = price / area;
  return formatPrice(pricePerM2) + '/m²';
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

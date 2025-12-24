import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  Divider,
  Paper,
  IconButton,
} from '@mui/material';
import { Close, AutoGraph } from '@mui/icons-material';
import { MapContainer, TileLayer, Popup, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapMarker, PredictionRequest, PredictionResult } from '../../types/house';
import { api } from '../../services/api';
import { formatPrice, formatArea, getMarkerColor } from '../../utils/formatters';

const center: [number, number] = [21.028511, 105.804817]; // Hanoi center

// Component to handle map click events
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      console.log('Map clicked at:', e.latlng.lat, e.latlng.lng);
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const PriceMap = () => {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  
  const [formData, setFormData] = useState<PredictionRequest>({
    area: 50,
    rooms: 3,
    toilets: 2,
    floors: 4,
    district: '',
    ward: '',
    lat: 21.028511,
    lng: 105.804817,
    width: 5,
    length: 10,
    legal: 1,
  });
  
  const [districts, setDistricts] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);

  useEffect(() => {
    loadMarkers();
    loadDistricts();
  }, []);

  useEffect(() => {
    if (formData.district) {
      loadWards(formData.district);
    }
  }, [formData.district]);

  const loadMarkers = async () => {
    try {
      setLoading(true);
      const data = await api.getMapMarkers();
      setMarkers(data);
    } catch (error) {
      console.error('Error loading markers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistricts = async () => {
    const data = await api.getDistricts();
    setDistricts(data);
  };

  const loadWards = async (district: string) => {
    const data = await api.getWards(district);
    setWards(data);
  };

  const handleMarkerClick = (marker: MapMarker, e?: any) => {
    console.log('Marker clicked:', marker);
    console.log('Marker data:', {
      id: marker.id,
      lat: marker.lat,
      lng: marker.lng,
      area: marker.area,
      rooms: marker.rooms,
      toilets: marker.toilets,
      floors: marker.floors,
      district: marker.district,
      ward: marker.ward,
      width: marker.width,
      length: marker.length,
      legal: marker.legal,
      price: marker.price,
      title: marker.title,
    });
    
    if (e) {
      e.originalEvent?.stopPropagation();
    }
    
    setSelectedMarker(marker);
    setFormData(prev => ({
      ...prev,
      lat: marker.lat,
      lng: marker.lng,
      area: marker.area || prev.area,
      rooms: marker.rooms ?? prev.rooms,
      toilets: marker.toilets ?? prev.toilets,
      floors: marker.floors ?? prev.floors,
      district: marker.district || prev.district,
      ward: marker.ward || prev.ward,
      width: marker.width ?? prev.width,
      length: marker.length ?? prev.length,
      legal: marker.legal ?? prev.legal,
    }));
    
    console.log('Form data after update:', formData);
    
    setPredictionResult(null);
    setDialogOpen(true);
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log('handleMapClick called with:', lat, lng);
    setSelectedMarker(null);
    setFormData({
      area: 50,
      rooms: 3,
      toilets: 2,
      floors: 4,
      district: '',
      ward: '',
      lat: lat,
      lng: lng,
      width: 5,
      length: 10,
      legal: 1,
    });
    setPredictionResult(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMarker(null);
    setPredictionResult(null);
  };

  const handleFormChange = (field: keyof PredictionRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPredictionLoading(true);
      const prediction = await api.predictPrice(formData);
      setPredictionResult(prediction);
    } catch (error) {
      console.error('Error predicting price:', error);
    } finally {
      setPredictionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 64,
          left: 240,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '@media (max-width: 900px)': {
            left: 0,
          },
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{
        position: 'fixed',
        top: 64,
        left: 240,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        '@media (max-width: 900px)': {
          left: 0,
        }
      }}>
        {/* Header */}
        <Box sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Bản đồ giá nhà - Hà Nội
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, bgcolor: '#4caf50', borderRadius: '50%' }} />
              <Typography variant="body2">{'< 5 tỷ'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, bgcolor: '#ffeb3b', borderRadius: '50%' }} />
              <Typography variant="body2">5-10 tỷ</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, bgcolor: '#ff9800', borderRadius: '50%' }} />
              <Typography variant="body2">10-20 tỷ</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, bgcolor: '#f44336', borderRadius: '50%' }} />
              <Typography variant="body2">{'> 20 tỷ'}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              ({markers.length} căn) | 💡 Click vào bất kỳ điểm nào trên bản đồ
            </Typography>
          </Box>
        </Box>

        {/* Map */}
        <Box sx={{ flexGrow: 1, position: 'relative', '& .leaflet-container': { height: '100%', width: '100%' } }}>
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler onMapClick={handleMapClick} />

            {markers.map((marker) => (
              <CircleMarker
                key={marker.id}
                center={[marker.lat, marker.lng]}
                radius={8}
                pathOptions={{
                  fillColor: getMarkerColor(marker.price_category),
                  fillOpacity: 0.8,
                  color: '#ffffff',
                  weight: 2,
                }}
                eventHandlers={{
                  click: (e) => {
                    // Dừng sự kiện để không trigger handleMapClick
                    L.DomEvent.stopPropagation(e);
                    handleMarkerClick(marker, e);
                  },
                }}
              >
                <Popup maxWidth={300}>
                  <Card sx={{ boxShadow: 'none', border: 'none' }}>
                    <Box
                      component="img"
                      src={marker.image_thumb}
                      alt={marker.title}
                      sx={{
                        width: '100%',
                        height: 150,
                        objectFit: 'cover',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkerClick(marker);
                      }}
                    />
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkerClick(marker);
                        }}
                      >
                        {marker.title}
                      </Typography>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {formatPrice(marker.price)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Diện tích: {formatArea(marker.area)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        💡 Click vào điểm này để dự đoán giá
                      </Typography>
                    </CardContent>
                  </Card>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </Box>
      </Box>

      {/* Prediction Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" component="span" fontWeight={600}>
              Dự đoán giá nhà
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              📍 Vị trí: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
              {selectedMarker && ' (Từ căn nhà đã chọn)'}
              {!selectedMarker && ' (Vị trí tùy chọn)'}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Left: Form */}
            <Grid item xs={12} md={6}>
              <form onSubmit={handleSubmitPrediction}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      label="Diện tích (m²)"
                      value={formData.area}
                      onChange={(e) => handleFormChange('area', parseFloat(e.target.value))}
                      inputProps={{ min: 10, max: 1000, step: 0.1 }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Số phòng ngủ"
                      value={formData.rooms || ''}
                      onChange={(e) =>
                        handleFormChange('rooms', e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      inputProps={{ min: 0, max: 20 }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Số toilet"
                      value={formData.toilets || ''}
                      onChange={(e) =>
                        handleFormChange('toilets', e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      inputProps={{ min: 0, max: 10 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Số tầng"
                      value={formData.floors || ''}
                      onChange={(e) =>
                        handleFormChange('floors', e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      inputProps={{ min: 1, max: 20 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Quận/Huyện"
                      value={formData.district || ''}
                      onChange={(e) => handleFormChange('district', e.target.value)}
                      SelectProps={{
                        MenuProps: {
                          PaperProps: {
                            sx: { maxHeight: 300 }
                          }
                        }
                      }}
                    >
                      <MenuItem value="">-- Chọn quận --</MenuItem>
                      {districts.map((district) => (
                        <MenuItem key={district} value={district}>
                          {district}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Phường/Xã"
                      value={formData.ward || ''}
                      onChange={(e) => handleFormChange('ward', e.target.value)}
                      disabled={!formData.district}
                      SelectProps={{
                        MenuProps: {
                          PaperProps: {
                            sx: { maxHeight: 300 }
                          }
                        }
                      }}
                    >
                      <MenuItem value="">-- Chọn phường --</MenuItem>
                      {wards.map((ward) => (
                        <MenuItem key={ward} value={ward}>
                          {ward}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Chiều rộng (m)"
                      value={formData.width || ''}
                      onChange={(e) =>
                        handleFormChange('width', e.target.value ? parseFloat(e.target.value) : undefined)
                      }
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Chiều dài (m)"
                      value={formData.length || ''}
                      onChange={(e) =>
                        handleFormChange('length', e.target.value ? parseFloat(e.target.value) : undefined)
                      }
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Tình trạng pháp lý"
                      value={formData.legal ?? ''}
                      onChange={(e) =>
                        handleFormChange('legal', e.target.value ? parseInt(e.target.value) : undefined)
                      }
                    >
                      <MenuItem value={1}>Sổ đỏ/Sổ hồng</MenuItem>
                      <MenuItem value={0}>Chưa có sổ</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Vĩ độ"
                      value={formData.lat}
                      onChange={(e) =>
                        handleFormChange('lat', parseFloat(e.target.value))
                      }
                      inputProps={{ step: 0.000001 }}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Kinh độ"
                      value={formData.lng}
                      onChange={(e) =>
                        handleFormChange('lng', parseFloat(e.target.value))
                      }
                      inputProps={{ step: 0.000001 }}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={predictionLoading}
                      startIcon={predictionLoading ? <CircularProgress size={20} /> : <AutoGraph />}
                    >
                      {predictionLoading ? 'Đang dự đoán...' : 'Dự đoán giá'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>

            {/* Right: Results */}
            <Grid item xs={12} md={6}>
              {predictionResult ? (
                <Box>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                    Kết quả dự đoán
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Giá dự đoán
                    </Typography>
                    <Typography variant="h4" color="primary" fontWeight={700}>
                      {formatPrice(predictionResult.predicted_price)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Khoảng tin cậy (85% - 115%)
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatPrice(predictionResult.confidence_interval.lower)} -{' '}
                      {formatPrice(predictionResult.confidence_interval.upper)}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Giá / m²
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatPrice(predictionResult.price_per_m2)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body1" fontWeight={600} gutterBottom>
                    Căn nhà tương tự
                  </Typography>
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {predictionResult.similar_houses.map((house, index) => (
                      <Paper key={index} sx={{ p: 1.5, mb: 1, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {house.title}
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Giá
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight={600}>
                              {formatPrice(house.price)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Diện tích
                            </Typography>
                            <Typography variant="body2">
                              {house.area} m²
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              {house.district} - {house.ward}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="primary">
                              📍 ~{house.distance_km.toFixed(2)} km
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Box>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    Dự đoán được tạo bởi mô hình ML, chỉ mang tính tham khảo.
                  </Alert>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: 300,
                    color: 'text.secondary',
                  }}
                >
                  <AutoGraph sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" color="text.secondary" align="center">
                    Nhập thông tin căn nhà
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    và nhấn "Dự đoán giá" để xem kết quả
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};
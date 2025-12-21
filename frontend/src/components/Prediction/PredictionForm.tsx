import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import { AutoGraph } from '@mui/icons-material';
import { PredictionRequest, PredictionResult } from '../../types/house';
import { api } from '../../services/api';
import { formatPrice, formatNumber } from '../../utils/formatters';

export const PredictionForm = () => {
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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    if (formData.district) {
      loadWards(formData.district);
    }
  }, [formData.district]);

  const loadDistricts = async () => {
    const data = await api.getDistricts();
    setDistricts(data);
  };

  const loadWards = async (district: string) => {
    const data = await api.getWards(district);
    setWards(data);
  };

  const handleChange = (field: keyof PredictionRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prediction = await api.predictPrice(formData);
      setResult(prediction);
    } catch (error) {
      console.error('Error predicting price:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dự đoán giá nhà
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Nhập thông tin căn nhà để nhận dự đoán giá từ mô hình AI
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight={600}>
                Thông tin căn nhà
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      label="Diện tích (m²)"
                      value={formData.area}
                      onChange={(e) => handleChange('area', parseFloat(e.target.value))}
                      inputProps={{ min: 10, max: 1000, step: 0.1 }}
                      size="medium"
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Số phòng ngủ"
                      value={formData.rooms || ''}
                      onChange={(e) =>
                        handleChange('rooms', e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      inputProps={{ min: 0, max: 20 }}
                      size="medium"
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Số toilet"
                      value={formData.toilets || ''}
                      onChange={(e) =>
                        handleChange('toilets', e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      inputProps={{ min: 0, max: 10 }}
                      size="medium"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Số tầng"
                      value={formData.floors || ''}
                      onChange={(e) =>
                        handleChange('floors', e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      inputProps={{ min: 1, max: 20 }}
                      size="medium"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Quận/Huyện"
                      value={formData.district || ''}
                      onChange={(e) => handleChange('district', e.target.value)}
                      size="medium"
                      SelectProps={{
                        MenuProps: {
                          PaperProps: {
                            sx: { maxHeight: 400 }
                          }
                        }
                      }}
                      sx={{ '& .MuiSelect-select': { py: 1.5 } }}
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
                      onChange={(e) => handleChange('ward', e.target.value)}
                      disabled={!formData.district}
                      size="medium"
                      SelectProps={{
                        MenuProps: {
                          PaperProps: {
                            sx: { maxHeight: 400 }
                          }
                        }
                      }}
                      sx={{ '& .MuiSelect-select': { py: 1.5 } }}
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
                        handleChange('width', e.target.value ? parseFloat(e.target.value) : undefined)
                      }
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                      size="medium"
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Chiều dài (m)"
                      value={formData.length || ''}
                      onChange={(e) =>
                        handleChange('length', e.target.value ? parseFloat(e.target.value) : undefined)
                      }
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                      size="medium"
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Vĩ độ"
                      value={formData.lat || ''}
                      onChange={(e) =>
                        handleChange('lat', e.target.value ? parseFloat(e.target.value) : undefined)
                      }
                      inputProps={{ step: 0.000001 }}
                      size="medium"
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Kinh độ"
                      value={formData.lng || ''}
                      onChange={(e) =>
                        handleChange('lng', e.target.value ? parseFloat(e.target.value) : undefined)
                      }
                      inputProps={{ step: 0.000001 }}
                      size="medium"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <AutoGraph />}
                    >
                      {loading ? 'Đang dự đoán...' : 'Dự đoán giá'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          {result ? (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom color="primary" fontWeight={600}>
                  Kết quả dự đoán
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    Giá dự đoán
                  </Typography>
                  <Typography variant="h3" color="primary" gutterBottom fontWeight={700}>
                    {formatPrice(result.predicted_price)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Khoảng tin cậy (85% - 115%)
                  </Typography>
                  <Typography variant="h6">
                    {formatPrice(result.confidence_interval.lower)} -{' '}
                    {formatPrice(result.confidence_interval.upper)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Giá / m²
                  </Typography>
                  <Typography variant="h6">
                    {formatPrice(result.price_per_m2)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Căn nhà tương tự
                </Typography>
                {result.similar_houses.map((house, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 1, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      {house.title}
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Giá
                        </Typography>
                        <Typography variant="body1" color="primary" fontWeight={600}>
                          {formatPrice(house.price)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Diện tích
                        </Typography>
                        <Typography variant="body1">
                          {house.area} m²
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Phòng ngủ
                        </Typography>
                        <Typography variant="body1">
                          {house.rooms || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Toilet
                        </Typography>
                        <Typography variant="body1">
                          {house.toilets || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Số tầng
                        </Typography>
                        <Typography variant="body1">
                          {house.floors || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Vị trí: {house.district} - {house.ward}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="primary">
                          📍 Khoảng cách: ~{house.distance_km.toFixed(2)} km
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}

                <Alert severity="info" sx={{ mt: 2 }}>
                  Dự đoán này được tạo bởi mô hình Machine Learning dựa trên dữ liệu thị trường.
                  Kết quả chỉ mang tính tham khảo.
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 300,
                    color: 'text.secondary',
                  }}
                >
                  <AutoGraph sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" color="text.secondary">
                    Nhập thông tin và nhấn "Dự đoán giá"
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    để nhận kết quả dự đoán từ AI
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

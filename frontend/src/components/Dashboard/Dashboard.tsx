import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { StatsOverview, PriceDistribution } from '../../types/house';
import { api } from '../../services/api';
import { formatPrice, formatNumber } from '../../utils/formatters';

const COLORS = ['#4caf50', '#ffeb3b', '#ff9800', '#f44336', '#9c27b0'];

export const Dashboard = () => {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [priceDistribution, setPriceDistribution] = useState<PriceDistribution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, distributionData] = await Promise.all([
        api.getStatsOverview(),
        api.getPriceDistribution(),
      ]);
      setStats(statsData);
      setPriceDistribution(distributionData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Thống kê
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Tổng số căn
              </Typography>
              <Typography variant="h4">
                {formatNumber(stats?.total_houses || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Giá trung bình
              </Typography>
              <Typography variant="h5">
                {formatPrice(stats?.average_price || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Giá trung vị
              </Typography>
              <Typography variant="h5">
                {formatPrice(stats?.median_price || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                DT trung bình
              </Typography>
              <Typography variant="h5">
                {stats?.average_area.toFixed(1)} m²
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Price Distribution Histogram */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Phân bố giá
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceDistribution?.histogram || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#1976d2" name="Số lượng" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Price by District */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Giá trung bình theo Quận
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={priceDistribution?.by_district
                .sort((a, b) => b.average_price - a.average_price)
                .slice(0, 10) || []}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => formatPrice(value)} />
              <YAxis
                type="category"
                dataKey="district"
                width={150}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => formatPrice(value)}
              />
              <Legend />
              <Bar
                dataKey="average_price"
                fill="#dc004e"
                name="Giá trung bình"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Price Distribution Pie Chart */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Phân bố theo mức giá
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priceDistribution?.histogram || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, percentage }) =>
                  `${range}: ${percentage.toFixed(1)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {priceDistribution?.histogram.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thông tin nổi bật
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" color="text.secondary">
                Quận đắt nhất:
              </Typography>
              <Typography variant="h6" color="error">
                {stats?.most_expensive_district}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" color="text.secondary">
                Quận rẻ nhất:
              </Typography>
              <Typography variant="h6" color="success.main">
                {stats?.most_affordable_district}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" color="text.secondary">
                Khoảng giá:
              </Typography>
              <Typography variant="body1">
                {formatPrice(stats?.price_range.min || 0)} -{' '}
                {formatPrice(stats?.price_range.max || 0)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" color="text.secondary">
                Tổng giá trị thị trường:
              </Typography>
              <Typography variant="h6">
                {formatPrice(stats?.total_value || 0)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

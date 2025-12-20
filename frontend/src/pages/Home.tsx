import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { Map as MapIcon, Dashboard, AutoGraph } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Bản đồ giá',
      description: 'Xem phân bố giá nhà trên bản đồ với Google Maps',
      icon: <MapIcon sx={{ fontSize: 60 }} />,
      path: '/map',
      color: '#1976d2',
    },
    {
      title: 'Dashboard',
      description: 'Thống kê và phân tích dữ liệu thị trường bất động sản',
      icon: <Dashboard sx={{ fontSize: 60 }} />,
      path: '/dashboard',
      color: '#dc004e',
    },
    {
      title: 'Dự đoán giá',
      description: 'Sử dụng AI để dự đoán giá nhà dựa trên đặc điểm',
      icon: <AutoGraph sx={{ fontSize: 60 }} />,
      path: '/predict',
      color: '#4caf50',
    },
  ];

  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Chào mừng đến với Ứng dụng Dự đoán Giá Nhà
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Khám phá thị trường bất động sản Hà Nội với công nghệ AI và trực quan hóa dữ liệu
      </Typography>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        {features.map((feature) => (
          <Grid item xs={12} md={4} key={feature.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ color: feature.color, mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {feature.description}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate(feature.path)}
                  sx={{ mt: 2, bgcolor: feature.color }}
                >
                  Khám phá
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Về dự án
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Ứng dụng này cung cấp công cụ phân tích và dự đoán giá nhà tại Hà Nội,
          sử dụng dữ liệu thực tế từ thị trường và thuật toán Machine Learning tiên tiến.
        </Typography>
        <Typography variant="body1">
          Dữ liệu được cập nhật thường xuyên để đảm bảo độ chính xác cao nhất.
        </Typography>
      </Box>
    </Box>
  );
};

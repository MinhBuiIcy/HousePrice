import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapMarker } from '../../types/house';
import { api } from '../../services/api';
import { formatPrice, formatArea, getMarkerColor } from '../../utils/formatters';

const center: [number, number] = [21.028511, 105.804817]; // Hanoi center

export const PriceMap = () => {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarkers();
  }, []);

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
            ({markers.length} căn)
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
                      }}
                    >
                      {marker.title}
                    </Typography>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {formatPrice(marker.price)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Diện tích: {formatArea(marker.area)}
                    </Typography>
                  </CardContent>
                </Card>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
};

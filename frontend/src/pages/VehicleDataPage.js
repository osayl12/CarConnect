import React, { useEffect, useState } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box,
  LinearProgress, Alert, Chip
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Speed, Thermostat, BatteryFull, Warning } from '@mui/icons-material';
import Navbar from '../components/shared/Navbar';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function VehicleDataPage() {
  const [sensorData, setSensorData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [latestRes, historyRes] = await Promise.all([
          api.get('/sensor-data/latest'),
          api.get('/sensor-data/history?limit=20'),
        ]);
        setSensorData(latestRes.data);
        setHistory(historyRes.data);
      } catch (err) {
        console.log('No sensor data available');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const tempColor = (temp) => {
    if (temp >= 110) return '#f44336';
    if (temp >= 90) return '#ff9800';
    return '#4caf50';
  };

  const batteryColor = (v) => {
    if (v < 11.5) return '#f44336';
    if (v < 12.2) return '#ff9800';
    return '#4caf50';
  };

  // Chart data for temperature history
  const chartData = {
    labels: history.map(d => new Date(d.timestamp).toLocaleTimeString('he-IL')),
    datasets: [
      {
        label: 'טמפרטורת מנוע (°C)',
        data: history.map(d => d.engineTemp),
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: false, min: 50, max: 130 } },
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>נתוני רכב בזמן אמת</Typography>

        {loading && <LinearProgress sx={{ mb: 3 }} />}

        {!sensorData && !loading && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            לא נמצא מודול ESP32/OBD2 מחובר. חבר את המודול לרכב כדי לראות נתונים בזמן אמת.
          </Alert>
        )}

        {/* Current readings */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Thermostat sx={{ fontSize: 40, color: sensorData ? tempColor(sensorData.engineTemp) : 'grey.400' }} />
                <Typography variant="h4" fontWeight="bold">
                  {sensorData ? `${sensorData.engineTemp}°C` : '--'}
                </Typography>
                <Typography color="text.secondary">טמפרטורת מנוע</Typography>
                {sensorData?.engineTemp >= 110 && (
                  <Chip label="⚠️ גבוהה מדי!" color="error" size="small" sx={{ mt: 1 }} />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <BatteryFull sx={{ fontSize: 40, color: sensorData ? batteryColor(sensorData.batteryVoltage) : 'grey.400' }} />
                <Typography variant="h4" fontWeight="bold">
                  {sensorData ? `${sensorData.batteryVoltage}V` : '--'}
                </Typography>
                <Typography color="text.secondary">מתח סוללה</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Speed sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h4" fontWeight="bold">
                  {sensorData ? `${sensorData.rpm}` : '--'}
                </Typography>
                <Typography color="text.secondary">סל"ד (RPM)</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Warning sx={{ fontSize: 40, color: sensorData?.dtcCodes?.length > 0 ? 'error.main' : 'success.main' }} />
                <Typography variant="h4" fontWeight="bold">
                  {sensorData ? sensorData.dtcCodes?.length || 0 : '--'}
                </Typography>
                <Typography color="text.secondary">קודי DTC</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* DTC Codes */}
        {sensorData?.dtcCodes?.length > 0 && (
          <Card sx={{ mb: 4, border: '1px solid', borderColor: 'error.main' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="error" mb={2}>
                ⚠️ קודי תקלה פעילים
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {sensorData.dtcCodes.map(code => (
                  <Chip key={code} label={code} color="error" variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Temperature Chart */}
        {history.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>היסטוריית טמפרטורת מנוע</Typography>
              <Line data={chartData} options={chartOptions} />
            </CardContent>
          </Card>
        )}
      </Container>
    </>
  );
}

import React, { useEffect, useState } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Button,
  Chip, Box, Avatar, Alert, CircularProgress
} from '@mui/material';
import {
  ReportProblem, DirectionsCar, CalendarMonth,
  History, Warning, CheckCircle, HourglassEmpty
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/shared/Navbar.jsx';
import api from '../services/api.jsx';

const STATUS_MAP = {
  pending: { label: 'ממתין למוסכניק', color: 'warning', icon: <HourglassEmpty /> },
  in_progress: { label: 'בטיפול', color: 'info', icon: <HourglassEmpty /> },
  resolved: { label: 'טופל', color: 'success', icon: <CheckCircle /> },
  awaiting_appointment: { label: 'ממתין לתיאום תור', color: 'secondary', icon: <CalendarMonth /> },
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ open: 0, resolved: 0, appointments: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/faults/my-faults');
        setFaults(res.data.slice(0, 5)); // Show last 5
        setStats({
          open: res.data.filter(f => f.status !== 'resolved').length,
          resolved: res.data.filter(f => f.status === 'resolved').length,
          appointments: res.data.filter(f => f.status === 'awaiting_appointment').length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    { label: 'דווח על תקלה', icon: <ReportProblem />, path: '/client/report-fault', color: '#d32f2f' },
    { label: 'נתוני רכב', icon: <DirectionsCar />, path: '/client/vehicle-data', color: '#1976d2' },
    { label: 'תורים', icon: <CalendarMonth />, path: '/client/appointments', color: '#388e3c' },
    { label: 'היסטוריה', icon: <History />, path: '/client/history', color: '#f57c00' },
  ];

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            {user?.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">שלום, {user?.name}! 👋</Typography>
            <Typography color="text.secondary">{user?.vehicleModel || 'רכב לא הוגדר'}</Typography>
          </Box>
        </Box>

        {/* Stats cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#fff3e0', borderRight: '4px solid #ff6f00' }}>
              <CardContent>
                <Typography color="text.secondary">תקלות פתוחות</Typography>
                <Typography variant="h3" fontWeight="bold" color="#ff6f00">{stats.open}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#e8f5e9', borderRight: '4px solid #4caf50' }}>
              <CardContent>
                <Typography color="text.secondary">תקלות שטופלו</Typography>
                <Typography variant="h3" fontWeight="bold" color="#4caf50">{stats.resolved}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#e3f2fd', borderRight: '4px solid #1976d2' }}>
              <CardContent>
                <Typography color="text.secondary">תורים ממתינים</Typography>
                <Typography variant="h3" fontWeight="bold" color="#1976d2">{stats.appointments}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick actions */}
        <Typography variant="h6" fontWeight="bold" mb={2}>פעולות מהירות</Typography>
        <Grid container spacing={2} mb={4}>
          {quickActions.map((action) => (
            <Grid item xs={6} sm={3} key={action.label}>
              <Card
                sx={{ cursor: 'pointer', transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}
                onClick={() => navigate(action.path)}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: action.color, mb: 1 }}>
                    {React.cloneElement(action.icon, { sx: { fontSize: 40 } })}
                  </Box>
                  <Typography fontWeight="bold">{action.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent faults */}
        <Typography variant="h6" fontWeight="bold" mb={2}>תקלות אחרונות</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center"><CircularProgress /></Box>
        ) : faults.length === 0 ? (
          <Alert severity="info">אין תקלות עדיין. כל הכבוד! 🚗✅</Alert>
        ) : (
          <Grid container spacing={2}>
            {faults.map((fault) => {
              const status = STATUS_MAP[fault.status] || STATUS_MAP.pending;
              return (
                <Grid item xs={12} key={fault._id}>
                  <Card variant="outlined">
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography fontWeight="bold">{fault.description?.substring(0, 60)}...</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(fault.createdAt).toLocaleDateString('he-IL')}
                        </Typography>
                      </Box>
                      <Chip
                        label={status.label}
                        color={status.color}
                        icon={status.icon}
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </>
  );
}

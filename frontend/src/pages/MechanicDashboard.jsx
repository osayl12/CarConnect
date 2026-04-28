import React, { useEffect, useState } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Button,
  Chip, Box, Avatar, Tab, Tabs, CircularProgress, Alert
} from '@mui/material';
import { Build, Person, DirectionsCar, CalendarMonth } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/shared/Navbar.jsx';
import api from '../services/api.jsx';

export default function MechanicDashboard() {
  const { user } = useAuth();
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchFaults = async () => {
      try {
        const res = await api.get('/faults/mechanic-faults');
        setFaults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaults();
  }, []);

  const pending = faults.filter(f => f.status === 'pending');
  const inProgress = faults.filter(f => f.status === 'in_progress');
  const resolved = faults.filter(f => f.status === 'resolved');

  const currentFaults = [pending, inProgress, resolved][tab];

  const updateStatus = async (faultId, status) => {
    try {
      await api.patch(`/faults/${faultId}/status`, { status });
      setFaults(prev => prev.map(f => f._id === faultId ? { ...f, status } : f));
    } catch (err) {
      alert('שגיאה בעדכון סטטוס');
    }
  };

  const statusColors = { pending: 'warning', in_progress: 'info', resolved: 'success' };
  const statusLabels = { pending: 'ממתין', in_progress: 'בטיפול', resolved: 'טופל' };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
            <Build />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">שלום, {user?.name}!</Typography>
            <Typography color="text.secondary">{user?.garageName}</Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#fff3e0', borderRight: '4px solid #ff6f00' }}>
              <CardContent>
                <Typography color="text.secondary">פניות חדשות</Typography>
                <Typography variant="h3" fontWeight="bold" color="#ff6f00">{pending.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#e3f2fd', borderRight: '4px solid #1976d2' }}>
              <CardContent>
                <Typography color="text.secondary">בטיפול</Typography>
                <Typography variant="h3" fontWeight="bold" color="#1976d2">{inProgress.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#e8f5e9', borderRight: '4px solid #4caf50' }}>
              <CardContent>
                <Typography color="text.secondary">טופלו</Typography>
                <Typography variant="h3" fontWeight="bold" color="#4caf50">{resolved.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label={`פניות חדשות (${pending.length})`} />
          <Tab label={`בטיפול (${inProgress.length})`} />
          <Tab label={`טופלו (${resolved.length})`} />
        </Tabs>

        {loading ? (
          <Box display="flex" justifyContent="center"><CircularProgress /></Box>
        ) : currentFaults.length === 0 ? (
          <Alert severity="info">אין פניות בקטגוריה זו</Alert>
        ) : (
          <Grid container spacing={2}>
            {currentFaults.map(fault => (
              <Grid item xs={12} key={fault._id}>
                <Card variant="outlined" sx={{ '&:hover': { boxShadow: 3 } }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Person fontSize="small" color="action" />
                          <Typography fontWeight="bold">{fault.clientId?.name}</Typography>
                          <DirectionsCar fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {fault.clientId?.vehicleModel}
                          </Typography>
                        </Box>
                        <Typography mb={1}>{fault.description}</Typography>
                        {fault.errorCode && (
                          <Chip label={`קוד שגיאה: ${fault.errorCode}`} size="small" color="error" sx={{ mb: 1 }} />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {new Date(fault.createdAt).toLocaleDateString('he-IL')}
                        </Typography>
                      </Box>
                      <Box display="flex" flexDirection="column" gap={1} ml={2}>
                        <Chip
                          label={statusLabels[fault.status]}
                          color={statusColors[fault.status]}
                          size="small"
                        />
                        {fault.status === 'pending' && (
                          <Button
                            variant="contained" size="small"
                            onClick={() => updateStatus(fault._id, 'in_progress')}
                          >
                            קח לטיפול
                          </Button>
                        )}
                        {fault.status === 'in_progress' && (
                          <Button
                            variant="contained" color="success" size="small"
                            onClick={() => updateStatus(fault._id, 'resolved')}
                          >
                            סמן כטופל
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}

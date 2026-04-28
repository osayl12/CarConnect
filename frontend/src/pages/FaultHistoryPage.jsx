import React, { useEffect, useState } from 'react';
import {
  Container, Card, CardContent, Typography, Box,
  Chip, Grid, TextField, MenuItem, CircularProgress, Alert
} from '@mui/material';
import { History } from '@mui/icons-material';
import Navbar from '../components/shared/Navbar.jsx';
import api from '../services/api.jsx';

const STATUS_MAP = {
  pending: { label: 'ממתין', color: 'warning' },
  in_progress: { label: 'בטיפול', color: 'info' },
  resolved: { label: 'טופל', color: 'success' },
  awaiting_appointment: { label: 'ממתין לתור', color: 'secondary' },
};

export default function FaultHistoryPage() {
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/faults/my-faults');
        setFaults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = filter === 'all' ? faults : faults.filter(f => f.status === filter);

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <History color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h5" fontWeight="bold">היסטוריית תקלות</Typography>
        </Box>

        <TextField
          select label="סנן לפי סטטוס" value={filter}
          onChange={e => setFilter(e.target.value)} sx={{ mb: 3, minWidth: 200 }}
        >
          <MenuItem value="all">הכל</MenuItem>
          <MenuItem value="pending">ממתין</MenuItem>
          <MenuItem value="in_progress">בטיפול</MenuItem>
          <MenuItem value="resolved">טופל</MenuItem>
        </TextField>

        {loading ? (
          <Box display="flex" justifyContent="center"><CircularProgress /></Box>
        ) : filtered.length === 0 ? (
          <Alert severity="info">לא נמצאו תקלות</Alert>
        ) : (
          <Grid container spacing={2}>
            {filtered.map(fault => {
              const status = STATUS_MAP[fault.status] || STATUS_MAP.pending;
              return (
                <Grid item xs={12} key={fault._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex={1}>
                          <Typography fontWeight="bold" mb={0.5}>{fault.description}</Typography>
                          {fault.errorCode && (
                            <Chip label={`OBD2: ${fault.errorCode}`} size="small" color="error" sx={{ mr: 1, mb: 1 }} />
                          )}
                          {fault.mechanicResponse && (
                            <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: 1, mt: 1 }}>
                              <Typography variant="body2" fontWeight="bold">תגובת מוסכניק:</Typography>
                              <Typography variant="body2">{fault.mechanicResponse}</Typography>
                            </Box>
                          )}
                          {fault.estimatedCost && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              💰 הערכת מחיר: ₪{fault.estimatedCost}
                            </Typography>
                          )}
                        </Box>
                        <Box textAlign="center" ml={2}>
                          <Chip label={status.label} color={status.color} size="small" sx={{ mb: 1 }} />
                          <Typography variant="caption" display="block" color="text.secondary">
                            {new Date(fault.createdAt).toLocaleDateString('he-IL')}
                          </Typography>
                        </Box>
                      </Box>
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

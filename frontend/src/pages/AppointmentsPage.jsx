import React, { useEffect, useState } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Button,
  Box, Chip, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress
} from '@mui/material';
import { CalendarMonth, Add } from '@mui/icons-material';
import Navbar from '../components/shared/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.jsx';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', time: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const endpoint = user.role === 'mechanic' ? '/appointments/my-slots' : '/appointments/my-appointments';
      const res = await api.get(endpoint);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = async () => {
    setSaving(true);
    try {
      await api.post('/appointments/add-slot', newSlot);
      setOpenDialog(false);
      setNewSlot({ date: '', time: '', notes: '' });
      fetchAppointments();
    } catch (err) {
      alert('שגיאה בהוספת מועד');
    } finally {
      setSaving(false);
    }
  };

  const bookAppointment = async (appointmentId) => {
    try {
      await api.patch(`/appointments/${appointmentId}/book`);
      fetchAppointments();
    } catch (err) {
      alert('שגיאה בתיאום תור');
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('לבטל את התור?')) return;
    try {
      await api.patch(`/appointments/${appointmentId}/cancel`);
      fetchAppointments();
    } catch (err) {
      alert('שגיאה בביטול תור');
    }
  };

  const statusColor = { available: 'success', booked: 'primary', cancelled: 'error' };
  const statusLabel = { available: 'פנוי', booked: 'תפוס', cancelled: 'בוטל' };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <CalendarMonth color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h5" fontWeight="bold">
              {user.role === 'mechanic' ? 'ניהול מועדים' : 'התורים שלי'}
            </Typography>
          </Box>
          {user.role === 'mechanic' && (
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
              הוסף מועד פנוי
            </Button>
          )}
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center"><CircularProgress /></Box>
        ) : appointments.length === 0 ? (
          <Alert severity="info">
            {user.role === 'mechanic' ? 'לא הגדרת מועדים פנויים עדיין' : 'אין לך תורים'}
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {appointments.map(apt => (
              <Grid item xs={12} sm={6} md={4} key={apt._id}>
                <Card variant="outlined" sx={{ '&:hover': { boxShadow: 3 } }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography fontWeight="bold">
                        {new Date(apt.date).toLocaleDateString('he-IL')}
                      </Typography>
                      <Chip label={statusLabel[apt.status]} color={statusColor[apt.status]} size="small" />
                    </Box>
                    <Typography color="text.secondary" mb={1}>⏰ {apt.time}</Typography>
                    {apt.notes && <Typography variant="body2" mb={1}>{apt.notes}</Typography>}
                    {apt.clientId && (
                      <Typography variant="body2">👤 {apt.clientId.name}</Typography>
                    )}
                    {user.role === 'client' && apt.status === 'available' && (
                      <Button
                        variant="contained" fullWidth sx={{ mt: 2 }}
                        onClick={() => bookAppointment(apt._id)}
                      >
                        קבע תור
                      </Button>
                    )}
                    {apt.status === 'booked' && (
                      <Button
                        variant="outlined" color="error" fullWidth sx={{ mt: 2 }}
                        onClick={() => cancelAppointment(apt._id)}
                      >
                        בטל תור
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Add slot dialog (mechanic only) */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>הוסף מועד פנוי</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth label="תאריך" type="date" value={newSlot.date}
              onChange={e => setNewSlot({ ...newSlot, date: e.target.value })}
              InputLabelProps={{ shrink: true }} sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              fullWidth label="שעה" type="time" value={newSlot.time}
              onChange={e => setNewSlot({ ...newSlot, time: e.target.value })}
              InputLabelProps={{ shrink: true }} sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="הערות (אופציונלי)" value={newSlot.notes}
              onChange={e => setNewSlot({ ...newSlot, notes: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>ביטול</Button>
            <Button onClick={addSlot} variant="contained" disabled={saving || !newSlot.date || !newSlot.time}>
              {saving ? 'שומר...' : 'הוסף'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

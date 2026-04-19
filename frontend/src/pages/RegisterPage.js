import React, { useState } from 'react';
import {
  Container, Box, TextField, Button, Typography, Alert,
  Paper, ToggleButton, ToggleButtonGroup, MenuItem, Link
} from '@mui/material';
import { DirectionsCar, Build } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VEHICLE_TYPES = ['פרטי', 'SUV', 'מסחרי', 'משאית', 'אופנוע'];

export default function RegisterPage() {
  const [role, setRole] = useState('client');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    // Client fields
    vehicleModel: '', vehicleYear: '', vehicleVIN: '', vehicleType: 'פרטי',
    // Mechanic fields
    garageName: '', garageAddress: '', garageServices: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, role };
      const user = await register(payload);
      navigate(user.role === 'mechanic' ? '/mechanic/dashboard' : '/client/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
          <Box textAlign="center" mb={2}>
            <DirectionsCar sx={{ fontSize: 50, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold" color="primary">CarConnect</Typography>
          </Box>

          <Typography variant="h5" textAlign="center" mb={2}>הרשמה</Typography>

          {/* Role selector */}
          <Box display="flex" justifyContent="center" mb={3}>
            <ToggleButtonGroup
              value={role} exclusive
              onChange={(e, v) => v && setRole(v)}
              color="primary"
            >
              <ToggleButton value="client">
                <DirectionsCar sx={{ mr: 1 }} /> לקוח
              </ToggleButton>
              <ToggleButton value="mechanic">
                <Build sx={{ mr: 1 }} /> מוסכניק
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Common fields */}
            <TextField fullWidth label="שם מלא" name="name" value={form.name} onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField fullWidth label="אימייל" name="email" type="email" value={form.email} onChange={handleChange} required sx={{ mb: 2 }} dir="ltr" />
            <TextField fullWidth label="סיסמה" name="password" type="password" value={form.password} onChange={handleChange} required sx={{ mb: 2 }} dir="ltr" />
            <TextField fullWidth label="טלפון" name="phone" value={form.phone} onChange={handleChange} required sx={{ mb: 2 }} dir="ltr" />

            {/* Client-specific fields */}
            {role === 'client' && (
              <>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>פרטי רכב</Typography>
                <TextField fullWidth label="דגם רכב (לדוג׳: Toyota Corolla)" name="vehicleModel" value={form.vehicleModel} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField fullWidth label="שנת ייצור" name="vehicleYear" type="number" value={form.vehicleYear} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField fullWidth label="מספר שלדה (VIN)" name="vehicleVIN" value={form.vehicleVIN} onChange={handleChange} sx={{ mb: 2 }} dir="ltr" />
                <TextField fullWidth select label="סוג רכב" name="vehicleType" value={form.vehicleType} onChange={handleChange} sx={{ mb: 2 }}>
                  {VEHICLE_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </>
            )}

            {/* Mechanic-specific fields */}
            {role === 'mechanic' && (
              <>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>פרטי מוסך</Typography>
                <TextField fullWidth label="שם המוסך" name="garageName" value={form.garageName} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField fullWidth label="כתובת המוסך" name="garageAddress" value={form.garageAddress} onChange={handleChange} sx={{ mb: 2 }} />
                <TextField fullWidth label="סוגי שירותים (לדוג׳: מנוע, חשמל, גלגלים)" name="garageServices" value={form.garageServices} onChange={handleChange} sx={{ mb: 2 }} />
              </>
            )}

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mb: 2, py: 1.5, borderRadius: 2 }}>
              {loading ? 'נרשם...' : 'הרשם'}
            </Button>
            <Typography textAlign="center">
              יש לך חשבון?{' '}
              <Link component={RouterLink} to="/login">התחבר</Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

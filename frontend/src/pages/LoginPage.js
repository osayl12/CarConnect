import React, { useState } from 'react';
import {
  Container, Box, TextField, Button, Typography,
  Alert, Paper, InputAdornment, IconButton, Link
} from '@mui/material';
import { Visibility, VisibilityOff, DirectionsCar } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'mechanic' ? '/mechanic/dashboard' : '/client/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בהתחברות, בדוק אימייל וסיסמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
          {/* Logo */}
          <Box textAlign="center" mb={3}>
            <DirectionsCar sx={{ fontSize: 60, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold" color="primary">
              CarConnect
            </Typography>
            <Typography variant="body2" color="text.secondary">
              מחבר לקוחות עם מוסכניקים
            </Typography>
          </Box>

          <Typography variant="h5" textAlign="center" mb={3}>
            התחברות
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="אימייל" name="email" type="email"
              value={form.email} onChange={handleChange}
              required sx={{ mb: 2 }}
              dir="ltr"
            />
            <TextField
              fullWidth label="סיסמה" name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password} onChange={handleChange}
              required sx={{ mb: 3 }}
              dir="ltr"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading} sx={{ mb: 2, py: 1.5, borderRadius: 2 }}
            >
              {loading ? 'מתחבר...' : 'התחבר'}
            </Button>
            <Typography textAlign="center">
              אין לך חשבון?{' '}
              <Link component={RouterLink} to="/register">
                הרשם עכשיו
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { DirectionsCar } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <DirectionsCar sx={{ fontSize: 80, color: 'grey.400' }} />
      <Typography variant="h3" fontWeight="bold" color="text.secondary">404</Typography>
      <Typography variant="h6" mb={3}>הדף לא נמצא</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>חזור לדף הבית</Button>
    </Box>
  );
}

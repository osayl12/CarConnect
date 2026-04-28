import React, { useState } from 'react';
import {
  Container, Box, TextField, Button, Typography,
  Alert, Paper, Stepper, Step, StepLabel, Chip
} from '@mui/material';
import { ReportProblem, CloudUpload, Send } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar.jsx';
import api from '../services/api.jsx';

const COMMON_FAULTS = [
  'נורת Check Engine דלוקה',
  'רעש חריג ממנוע',
  'בעיית בלמים',
  'דליפת שמן',
  'בעיית מיזוג אוויר',
  'בעיית חשמל',
  'צמיג שטוח',
  'בעיית גיר',
];

const steps = ['תיאור תקלה', 'פרטים נוספים', 'שליחה'];

export default function FaultReportPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    description: '',
    errorCode: '',
    severity: 'medium',
    additionalNotes: '',
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('description', form.description + (selectedTags.length > 0 ? `\nתגיות: ${selectedTags.join(', ')}` : ''));
      formData.append('errorCode', form.errorCode);
      formData.append('severity', form.severity);
      formData.append('additionalNotes', form.additionalNotes);
      if (image) formData.append('image', image);

      await api.post('/faults', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      setTimeout(() => navigate('/client/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בשליחת הדיווח');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
          <Send sx={{ fontSize: 80, color: 'success.main' }} />
          <Typography variant="h5" fontWeight="bold" mt={2}>הדיווח נשלח בהצלחה!</Typography>
          <Typography color="text.secondary">מועבר לדשבורד...</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <ReportProblem color="error" sx={{ fontSize: 40 }} />
            <Typography variant="h5" fontWeight="bold">דיווח על תקלה</Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Step 1: Description */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                בחר תקלות נפוצות (אופציונלי):
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                {COMMON_FAULTS.map(fault => (
                  <Chip
                    key={fault}
                    label={fault}
                    onClick={() => toggleTag(fault)}
                    color={selectedTags.includes(fault) ? 'primary' : 'default'}
                    variant={selectedTags.includes(fault) ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
              <TextField
                fullWidth
                multiline rows={4}
                label="תאר את התקלה בפירוט"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
                placeholder="לדוגמה: שמעתי רעש חריג ממנוע הרכב בזמן האצה..."
              />
            </Box>
          )}

          {/* Step 2: Additional details */}
          {activeStep === 1 && (
            <Box>
              <TextField
                fullWidth label="קוד שגיאה (OBD2) - אם ידוע"
                value={form.errorCode}
                onChange={e => setForm({ ...form, errorCode: e.target.value })}
                sx={{ mb: 3 }} dir="ltr"
                placeholder="P0300, P0171..."
              />
              <TextField
                fullWidth select
                label="רמת חומרה"
                value={form.severity}
                onChange={e => setForm({ ...form, severity: e.target.value })}
                sx={{ mb: 3 }}
                SelectProps={{ native: true }}
              >
                <option value="low">נמוך - לא דחוף</option>
                <option value="medium">בינוני - צריך לטפל בקרוב</option>
                <option value="high">גבוה - דחוף!</option>
                <option value="critical">קריטי - לא ניתן לנסוע!</option>
              </TextField>
              <TextField
                fullWidth multiline rows={3}
                label="הערות נוספות"
                value={form.additionalNotes}
                onChange={e => setForm({ ...form, additionalNotes: e.target.value })}
                sx={{ mb: 3 }}
              />
              <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
                צרף תמונה (אופציונלי)
                <input type="file" hidden accept="image/*" onChange={e => setImage(e.target.files[0])} />
              </Button>
              {image && <Typography variant="body2" sx={{ mt: 1 }}>✅ {image.name}</Typography>}
            </Box>
          )}

          {/* Step 3: Summary */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" mb={2}>סיכום הדיווח:</Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                <Typography><strong>תיאור:</strong> {form.description}</Typography>
                {selectedTags.length > 0 && (
                  <Typography><strong>תגיות:</strong> {selectedTags.join(', ')}</Typography>
                )}
                {form.errorCode && <Typography><strong>קוד שגיאה:</strong> {form.errorCode}</Typography>}
                <Typography><strong>חומרה:</strong> {
                  { low: 'נמוך', medium: 'בינוני', high: 'גבוה', critical: 'קריטי' }[form.severity]
                }</Typography>
                {image && <Typography><strong>תמונה:</strong> {image.name}</Typography>}
              </Paper>
              <Alert severity="info">הדיווח יישלח לכל המוסכניקים הזמינים</Alert>
            </Box>
          )}

          {/* Navigation buttons */}
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button disabled={activeStep === 0} onClick={handleBack}>חזור</Button>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext} disabled={!form.description && activeStep === 0}>
                הבא
              </Button>
            ) : (
              <Button
                variant="contained" color="success"
                startIcon={<Send />}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'שולח...' : 'שלח דיווח'}
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </>
  );
}

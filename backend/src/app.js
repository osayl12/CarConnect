const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const healthRoutes = require('./routes/health.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
// In production, CORS_ORIGIN should be set to the deployed frontend's
// public URL (see backend/.env.example). Falls back to wide-open for local
// dev, where the frontend runs on a different port and origin doesn't matter.
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded fault-report images (see Fault Reporting milestone).
app.use('/uploads', express.static('uploads'));

app.use('/api/health', healthRoutes);
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/vehicles', require('./routes/vehicle.routes'));
app.use('/api/faults', require('./routes/fault.routes'));
app.use('/api/appointments', require('./routes/appointment.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;

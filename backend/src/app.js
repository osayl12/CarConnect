const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded fault-report images (see Fault Reporting milestone).
app.use('/uploads', express.static('uploads'));

app.use('/api/health', healthRoutes);
app.use('/api/auth', require('./routes/auth.routes'));
// Future routes mount here, e.g.:
// app.use('/api/vehicles', require('./routes/vehicle.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;

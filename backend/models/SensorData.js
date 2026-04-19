const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleVIN: String,

  // Real-time sensor readings from ESP32/OBD2
  engineTemp: Number,      // Celsius
  batteryVoltage: Number,  // Volts
  rpm: Number,             // Revolutions per minute
  speed: Number,           // km/h
  fuelLevel: Number,       // Percentage
  dtcCodes: [String],      // List of DTC error codes (P0300, etc.)

  timestamp: { type: Date, default: Date.now },
});

// Keep only last 1000 readings per vehicle
sensorDataSchema.index({ clientId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);

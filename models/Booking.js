const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  officeId: { type: String, required: true },
  startTime: { type: Date, required: true },
  durationHours: { type: Number, required: true },
});

module.exports = mongoose.model('Booking', BookingSchema); 
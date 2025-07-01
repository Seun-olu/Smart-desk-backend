const mongoose = require('mongoose');



const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  bookingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  cancellations: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', UserSchema); 
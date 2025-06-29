const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
}, { _id: false });

const OfficeSchema = new mongoose.Schema({
  officeId: { type: String, required: true, unique: true },
  officeName: { type: String, required: true },
  availability: [AvailabilitySchema],
});

module.exports = mongoose.model('Office', OfficeSchema); 
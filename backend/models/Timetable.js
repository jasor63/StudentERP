const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  createdAt: { type: Date, default: Date.now }
});

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;

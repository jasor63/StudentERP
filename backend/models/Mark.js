const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    marks: { type: Number, required: true },
    semester: { type: Number, required: true }
}, { timestamps: true });

const Mark = mongoose.model('Mark', markSchema);

module.exports = Mark;

const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }
}, { timestamps: true });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;

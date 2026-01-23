const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    marks: { type: Number, default: 0 },
    cia1: { type: Number, default: 0 },
    cia2: { type: Number, default: 0 },
    cia3: { type: Number, default: 0 },
    internal1: { type: Number, default: 0 },
    internal2: { type: Number, default: 0 },
    attendance: { type: Number, default: 0 },
    library: { type: Number, default: 0 },
    semester: { type: Number, required: true }
}, { timestamps: true });

const Mark = mongoose.model('Mark', markSchema);

module.exports = Mark;

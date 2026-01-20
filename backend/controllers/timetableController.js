const Timetable = require('../models/Timetable');
const multer = require('multer');
const path = require('path');

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

exports.uploadMiddleware = upload.single('timetable');

exports.uploadTimetable = async (req, res) => {
    try {
        const { studentIds, title } = req.body;
        const imageUrl = `/uploads/${req.file.filename}`;

        const studentIdsArray = Array.isArray(studentIds) ? studentIds : JSON.parse(studentIds);

        const newTimetable = new Timetable({
            title,
            imageUrl,
            studentIds: studentIdsArray
        });

        await newTimetable.save();
        res.status(201).json({ message: 'Timetable uploaded successfully', timetable: newTimetable });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTimetableByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        const timetable = await Timetable.findOne({ studentIds: studentId }).sort({ createdAt: -1 });

        if (!timetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }

        res.json(timetable);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllTimetables = async (req, res) => {
    try {
        const timetables = await Timetable.find().populate('studentIds', 'name email').sort({ createdAt: -1 });
        res.json(timetables);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteTimetable = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTimetable = await Timetable.findByIdAndDelete(id);
        
        if (!deletedTimetable) {
            return res.status(404).json({ message: 'Timetable not found' });
        }

        // Optional: Delete the file from the uploads folder
        const fs = require('fs');
        const filePath = path.join(__dirname, '..', deletedTimetable.imageUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ message: 'Timetable deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

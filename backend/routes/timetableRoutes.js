const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');

router.post('/upload', timetableController.uploadMiddleware, timetableController.uploadTimetable);
router.get('/student/:studentId', timetableController.getTimetableByStudentId);
router.get('/', timetableController.getAllTimetables);
router.delete('/:id', timetableController.deleteTimetable);

module.exports = router;

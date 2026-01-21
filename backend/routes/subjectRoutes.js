const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');

router.get('/', subjectController.getAllSubjects);
router.get('/course/:courseId', subjectController.getSubjectsByCourse);
router.post('/', subjectController.createSubject);
router.delete('/:id', subjectController.deleteSubject);

module.exports = router;

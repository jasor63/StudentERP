const express = require('express');
const router = express.Router();
const markController = require('../controllers/markController');

router.post('/enter', markController.enterMarks);
router.get('/student/:studentId', markController.getStudentMarks);
router.get('/subject/:subjectId/:semester', markController.getMarksBySubject);
router.delete('/assignment/:subjectId/:semester', markController.deleteAssignment);
router.get('/assigned-subjects/:courseId/:semester', markController.getAssignedSubjects);

module.exports = router;

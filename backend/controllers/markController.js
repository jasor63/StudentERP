const mongoose = require("mongoose");
const Mark = require("../models/Mark");
const Student = require("../models/Student");
const Subject = require("../models/Subject");

exports.enterMarks = async (req, res) => {
    try {
        const { marksData, assessmentType } = req.body; // Expecting [{ student, subject, marks, semester }], assessmentType
        if (!Array.isArray(marksData)) {
            throw new Error('marksData must be an array');
        }

        const results = await Promise.all(marksData.map(async (data) => {
            // Find existing record to get other assessment marks
            let markRecord = await Mark.findOne({ student: data.student, subject: data.subject, semester: data.semester });
            
            if (!markRecord) {
                markRecord = new Mark({
                    student: data.student,
                    subject: data.subject,
                    semester: data.semester,
                    faculty: data.faculty
                });
            }

            // Update the specific assessment field
            if (assessmentType && assessmentType !== 'marks') {
                markRecord[assessmentType] = data.marks;
            } else {
                markRecord.marks = data.marks;
            }

            // Calculate total marks (if not manually entering 'marks')
            if (assessmentType && assessmentType !== 'marks') {
                markRecord.marks = 
                    (markRecord.cia1 || 0) + 
                    (markRecord.cia2 || 0) + 
                    (markRecord.cia3 || 0) + 
                    (markRecord.internal1 || 0) + 
                    (markRecord.internal2 || 0) + 
                    (markRecord.attendance || 0) + 
                    (markRecord.library || 0);
            }

            markRecord.faculty = data.faculty;
            return await markRecord.save();
        }));

        res.json({ message: "Marks entered/updated successfully", results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStudentMarks = async (req, res) => {
    try {
        const marks = await Mark.find({ student: req.params.studentId })
            .populate('subject')
            .populate('faculty')
            .sort({ semester: 1 });
        res.json(marks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMarksBySubject = async (req, res) => {
    try {
        const { subjectId, semester } = req.params;
        const marks = await Mark.find({ subject: subjectId, semester: semester })
            .populate('student')
            .populate('faculty');
        res.json(marks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAssignment = async (req, res) => {
    try {
        const { subjectId, semester } = req.params;
        const result = await Mark.deleteMany({ subject: subjectId, semester: semester });
        res.json({ message: "Assignment deleted successfully", deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAssignedSubjects = async (req, res) => {
    try {
        const { courseId, semester } = req.params;
        const semNum = parseInt(semester);

        // 1. Get all subjects for this course
        const subjects = await Subject.find({ course: courseId });
        
        if (subjects.length === 0) {
            return res.json([]);
        }

        const subjectIds = subjects.map(s => s._id);

        // 2. Find which of these subjects have Mark records for the given semester
        // We also want to make sure these Mark records belong to students of this course
        // but for a dropdown, showing subjects assigned to ANY student is usually enough,
        // and subjects are already course-specific.
        const assignedMarks = await Mark.find({
            subject: { $in: subjectIds },
            semester: semNum
        }).distinct('subject');

        // 3. Filter the original subjects list to only include those with assignments
        const filteredSubjects = subjects.filter(s => 
            assignedMarks.some(amId => amId.toString() === s._id.toString())
        );

        res.json(filteredSubjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const Mark = require("../models/Mark");

exports.enterMarks = async (req, res) => {
    try {
        const { marksData } = req.body; // Expecting [{ student, subject, marks, semester }]
        if (!Array.isArray(marksData)) {
            throw new Error('marksData must be an array');
        }

        const results = await Promise.all(marksData.map(async (data) => {
            return await Mark.findOneAndUpdate(
                { student: data.student, subject: data.subject, semester: data.semester },
                { marks: data.marks, faculty: data.faculty },
                { upsert: true, new: true }
            );
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

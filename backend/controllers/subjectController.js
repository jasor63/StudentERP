const Subject = require("../models/Subject");

exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().populate('course');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSubjectsByCourse = async (req, res) => {
    try {
        const subjects = await Subject.find({ course: req.params.courseId });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createSubject = async (req, res) => {
    try {
        const newSubject = new Subject(req.body);
        await newSubject.save();
        res.status(201).json({
            message: "Subject created successfully",
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);
        res.json({ message: "Subject deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

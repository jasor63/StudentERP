const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('course'); // Populate the 'course' field
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('course'); // Populate the 'course' field
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, password, email, course } = req.body;
    const newStudent = new Student({ name, password, email, course });
    await newStudent.save();
    res.status(201).json({
      message: "Student created Successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({
      message: "Student details Updated!"
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const deletedStudent = await Student.findByIdAndDelete(student._id);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { updates, date, courseId } = req.body; // Expecting { updates: [{studentId, status}], date, courseId }
    if (!Array.isArray(updates)) {
      throw new Error('Updates must be an array');
    }

    const attendanceRecords = updates.map(update => ({
      student: update.studentId,
      course: courseId,
      date: new Date(date),
      status: update.status || 'Present'
    }));

    await Attendance.insertMany(attendanceRecords);
    res.json({ message: "Attendance marked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.totalAttendance = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    let query = {};
    if (courseId) query.course = courseId;
    if (studentId) query.student = studentId;

    // Total lectures conducted for a course (unique dates in Attendance records for that course)
    // For simplicity, we can count total records if we assume one per lecture per student
    // But a better way is to count distinct dates for a course
    const totalLectures = await Attendance.distinct('date', { course: courseId });
    
    // Total attended by student
    const totalAttended = await Attendance.countDocuments({ 
        student: studentId, 
        course: courseId, 
        status: 'Present' 
    });

    res.json({
      totalLectures: totalLectures.length,
      totalAttended: totalAttended
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await Attendance.find({ student: id })
      .populate('course')
      .sort({ date: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Form, Button, Table } from 'react-bootstrap';
import NotificationToast from '../NotificationToast';

function ManageMarksBody() {
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [semester, setSemester] = useState(1);
    const [marksData, setMarksData] = useState({}); // { studentId: marks }
    const [assessmentType, setAssessmentType] = useState('marks');
    const [message, setMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    const assessments = [
        { value: 'marks', label: 'Total Marks (Manual)' },
        { value: 'cia1', label: 'CIA 1' },
        { value: 'cia2', label: 'CIA 2' },
        { value: 'cia3', label: 'CIA 3' },
        { value: 'internal1', label: 'Internal 1' },
        { value: 'internal2', label: 'Internal 2' },
        { value: 'attendance', label: 'Attendance' },
        { value: 'library', label: 'Library' },
    ];

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchSubjects(selectedCourse, semester);
            fetchStudents(selectedCourse);
        }
    }, [selectedCourse, semester]);

    const fetchCourses = async () => {
        try {
            const response = await fetch("http://localhost:5173/api/courses");
            const data = await response.json();
            setCourses(data);
            if (data.length > 0) setSelectedCourse(data[0]._id);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchSubjects = async (courseId, sem) => {
        try {
            const response = await fetch(`http://localhost:5173/api/marks/assigned-subjects/${courseId}/${sem}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setSubjects(data);
                if (data.length > 0) setSelectedSubject(data[0]._id);
                else setSelectedSubject('');
            } else {
                setSubjects([]);
                setSelectedSubject('');
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setSubjects([]);
            setSelectedSubject('');
        }
    };

    const fetchStudents = async (courseId) => {
        try {
            const response = await fetch("http://localhost:5173/api/students");
            const data = await response.json();
            const filtered = data.filter(s => s.course._id === courseId || s.course === courseId);
            setStudents(filtered);
            
            // Re-initialize marksData when students change, but maybe we should fetch existing marks too
            if (selectedSubject) {
                fetchExistingMarks(selectedSubject, semester, assessmentType);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const [fullMarksData, setFullMarksData] = useState([]);

    const fetchExistingMarks = async (subjectId, sem, type) => {
        try {
            const response = await fetch(`http://localhost:5173/api/marks/subject/${subjectId}/${sem}`);
            const data = await response.json();
            setFullMarksData(data);
            const existingMarks = {};
            data.forEach(m => {
                existingMarks[m.student._id] = m[type] || 0;
            });
            setMarksData(existingMarks);
        } catch (error) {
            console.error('Error fetching existing marks:', error);
        }
    };

    useEffect(() => {
        if (selectedSubject && semester) {
            fetchExistingMarks(selectedSubject, semester, assessmentType);
        }
    }, [selectedSubject, semester, assessmentType]);

    const handleMarkChange = (studentId, value) => {
        setMarksData(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedData = students.map(student => ({
            student: student._id,
            subject: selectedSubject,
            marks: marksData[student._id] || 0,
            semester: semester
        }));

        try {
            const response = await fetch("http://localhost:5173/api/marks/enter", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ marksData: formattedData, assessmentType: assessmentType })
            });
            if (response.ok) {
                setMessage("Marks updated successfully!");
                setShowToast(true);
            } else {
                setMessage("Failed to update marks");
                setShowToast(true);
            }
        } catch (error) {
            console.error('Error submitting marks:', error);
            setMessage("An error occurred");
            setShowToast(true);
        }
    };

    return (
        <div className="mx-5">
            <Card className="p-4 shadow border-0 rounded-4">
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Course</Form.Label>
                                <Form.Select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Subject</Form.Label>
                                <Form.Select 
                                    value={selectedSubject} 
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    disabled={subjects.length === 0}
                                >
                                    <option value="">{subjects.length > 0 ? "Select Subject" : "No subjects assigned"}</option>
                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Semester</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    min="1" 
                                    max="8" 
                                    value={semester} 
                                    onChange={(e) => setSemester(e.target.value)} 
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Assessment Type</Form.Label>
                                <Form.Select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value)}>
                                    {assessments.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {selectedSubject && (
                        <div className="mt-4">
                            <Table hover responsive className="align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Email</th>
                                        <th style={{ width: '150px' }}>Marks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student._id}>
                                            <td>{student.name}</td>
                                            <td className="text-muted">{student.email}</td>
                                            <td>
                                                <Form.Control 
                                                    type="number" 
                                                    value={marksData[student._id] || ''} 
                                                    placeholder="0"
                                                    onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <div className="d-flex justify-content-end mt-3">
                                <Button variant="success" type="submit" className="px-5 rounded-pill shadow-sm">
                                    Save Marks
                                </Button>
                            </div>
                        </div>
                    )}
                    {!selectedSubject && <p className="text-center text-muted mt-4">Please select a subject to enter marks.</p>}
                </Form>
            </Card>

            {selectedSubject && fullMarksData.length > 0 && (
                <Card className="p-4 shadow border-0 rounded-4 mt-5 mb-5">
                    <h5 className="mb-4 text-primary">Class Marks Summary</h5>
                    <Table hover responsive striped bordered className="text-center align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>Student Name</th>
                                <th>CIA 1</th>
                                <th>CIA 2</th>
                                <th>CIA 3</th>
                                <th>Int 1</th>
                                <th>Int 2</th>
                                <th>Att</th>
                                <th>Lib</th>
                                <th>Total (/100)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => {
                                const m = fullMarksData.find(md => md.student._id === student._id);
                                return (
                                    <tr key={student._id}>
                                        <td className="text-start">{student.name}</td>
                                        <td>{m?.cia1 || 0}</td>
                                        <td>{m?.cia2 || 0}</td>
                                        <td>{m?.cia3 || 0}</td>
                                        <td>{m?.internal1 || 0}</td>
                                        <td>{m?.internal2 || 0}</td>
                                        <td>{m?.attendance || 0}</td>
                                        <td>{m?.library || 0}</td>
                                        <td className="fw-bold text-success">{m?.marks || 0}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Card>
            )}
            <NotificationToast show={showToast} setShow={setShowToast} message={message} />
        </div>
    );
}

export default ManageMarksBody;

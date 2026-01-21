import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Form, Button, Table, InputGroup, Badge } from 'react-bootstrap';
import NotificationToast from '../NotificationToast';

function ManageSubjectsBody() {
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [subjectName, setSubjectName] = useState('');
    const [semester, setSemester] = useState(1);
    const [message, setMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        fetchCourses();
        fetchFaculties();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchStudents(selectedCourse);
        }
    }, [selectedCourse]);

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

    const fetchFaculties = async () => {
        try {
            const response = await fetch("http://localhost:5173/api/faculty");
            const data = await response.json();
            // Filter out admin if necessary, or show all
            setFaculties(data);
            if (data.length > 0) setSelectedFaculty(data[0]._id);
        } catch (error) {
            console.error('Error fetching faculties:', error);
        }
    };

    const fetchStudents = async (courseId) => {
        try {
            const response = await fetch("http://localhost:5173/api/students");
            const data = await response.json();
            const filtered = data.filter(s => s.course._id === courseId || s.course === courseId);
            setStudents(filtered);
            setSelectedStudents([]); // Reset selection when course changes
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleSelectStudent = (studentId) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId) 
                : [...prev, studentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(s => s._id));
        }
    };

    const [assignedSubjects, setAssignedSubjects] = useState([]);

    useEffect(() => {
        if (selectedCourse) {
            fetchAssignedSubjects();
        }
    }, [selectedCourse]);

    const fetchAssignedSubjects = async () => {
        try {
            // This is a bit complex because subjects are linked to students via Marks
            // We'll fetch all marks for students in this course and group by subject/semester
            const studentsResp = await fetch("http://localhost:5173/api/students");
            const studentsData = await studentsResp.json();
            const courseStudents = studentsData.filter(s => s.course._id === selectedCourse || s.course === selectedCourse);
            
            if (courseStudents.length === 0) {
                setAssignedSubjects([]);
                return;
            }

            // Fetch marks for the first student to get unique subject assignments for the course
            // (Assuming subjects are assigned to the whole course consistently)
            const marksResp = await fetch(`http://localhost:5173/api/marks/student/${courseStudents[0]._id}`);
            const marksData = await marksResp.json();
            
            const uniqueAssignments = [];
            const seen = new Set();

            marksData.forEach(m => {
                const key = `${m.subject._id}-${m.semester}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueAssignments.push({
                        id: m._id,
                        subjectId: m.subject._id,
                        subjectName: m.subject.name,
                        facultyName: m.faculty ? m.faculty.name : 'N/A',
                        semester: m.semester,
                        assignedCount: marksData.filter(md => md.subject._id === m.subject._id && md.semester === m.semester).length
                    });
                }
            });

            setAssignedSubjects(uniqueAssignments);
        } catch (error) {
            console.error('Error fetching assigned subjects:', error);
        }
    };

    const handleDeleteAssignment = async (subjectId, semester, subjectName) => {
        if (!window.confirm(`Are you sure you want to delete the assignment for "${subjectName}" in Semester ${semester}? This will remove it for all students.`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5173/api/marks/assignment/${subjectId}/${semester}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setMessage(`Assignment for "${subjectName}" deleted successfully!`);
                setShowToast(true);
                fetchAssignedSubjects(); // Refresh the table
            } else {
                setMessage("Failed to delete assignment");
                setShowToast(true);
            }
        } catch (error) {
            console.error('Error deleting assignment:', error);
            setMessage("An error occurred during deletion");
            setShowToast(true);
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        if (!subjectName || selectedStudents.length === 0 || !selectedFaculty) {
            setMessage("Please enter subject name, select faculty and select at least one student");
            setShowToast(true);
            return;
        }

        try {
            // 1. Create the subject first or check if it exists for the course
            const subjResponse = await fetch("http://localhost:5173/api/subjects", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: subjectName, course: selectedCourse })
            });

            let subject;
            const allSubjsResp = await fetch("http://localhost:5173/api/subjects");
            const allSubjs = await allSubjsResp.json();
            subject = allSubjs.find(s => s.name === subjectName && (s.course._id === selectedCourse || s.course === selectedCourse));

            if (!subject) {
                throw new Error("Subject creation/retrieval failed");
            }

            // 2. Initialize marks (mark as subject assigned) for selected students
            const marksData = selectedStudents.map(studentId => ({
                student: studentId,
                subject: subject._id,
                faculty: selectedFaculty,
                marks: 0,
                semester: semester
            }));

            const marksResponse = await fetch("http://localhost:5173/api/marks/enter", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ marksData })
            });

            if (marksResponse.ok) {
                setMessage(`Subject "${subjectName}" assigned to ${selectedStudents.length} students!`);
                setShowToast(true);
                setSubjectName('');
                setSelectedStudents([]);
                fetchAssignedSubjects(); // Refresh the table
            } else {
                setMessage("Failed to assign subject");
                setShowToast(true);
            }

        } catch (error) {
            console.error('Error assigning subject:', error);
            setMessage("An error occurred");
            setShowToast(true);
        }
    };

    return (
        <div className="mx-5 mb-5">
            <Card className="p-4 shadow border-0 rounded-4">
                <Form onSubmit={handleAddSubject}>
                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Step 1: Select Course</Form.Label>
                                <Form.Select 
                                    value={selectedCourse} 
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="border-success"
                                >
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="fw-bold">Step 2: Assign Faculty</Form.Label>
                                <Form.Select 
                                    value={selectedFaculty} 
                                    onChange={(e) => setSelectedFaculty(e.target.value)}
                                    className="border-success"
                                >
                                    <option value="">Select Faculty</option>
                                    {faculties.map(f => <option key={f._id} value={f._id}>{f.name} ({f.email})</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Step 3: Subject Details and Semester</Form.Label>
                                <InputGroup className="mb-2">
                                    <Form.Control 
                                        placeholder="Subject Name" 
                                        value={subjectName} 
                                        onChange={(e) => setSubjectName(e.target.value)}
                                        className="border-success"
                                    />
                                    <Form.Control 
                                        type="number" 
                                        placeholder="Sem" 
                                        style={{ maxWidth: '80px' }}
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value)}
                                        className="border-success"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Label className="fw-bold">Step 4: Select Students ({selectedStudents.length} selected)</Form.Label>
                    <div className="border border-2 rounded-4 overflow-hidden mb-4 scrollable-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <Table hover responsive className="mb-0">
                            <thead className="table-success sticky-top">
                                <tr>
                                    <th className="ps-4">
                                        <Form.Check 
                                            type="checkbox" 
                                            checked={students.length > 0 && selectedStudents.length === students.length}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th>Name</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student._id}>
                                        <td className="ps-4">
                                            <Form.Check 
                                                type="checkbox" 
                                                checked={selectedStudents.includes(student._id)}
                                                onChange={() => handleSelectStudent(student._id)}
                                            />
                                        </td>
                                        <td>{student.name}</td>
                                        <td className="text-muted">{student.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    <div className="d-grid mt-4">
                        <Button 
                            variant="success" 
                            type="submit" 
                            className="py-3 rounded-pill fw-bold shadow-sm"
                            disabled={selectedStudents.length === 0 || !subjectName || !selectedFaculty}
                        >
                            Assign Subject and Faculty to Selected Students
                        </Button>
                    </div>
                </Form>
            </Card>

            <Card className="mt-5 p-4 shadow border-0 rounded-4">
                <h5 className="mb-4 text-success fw-bold">Currently Assigned Subjects for this Course</h5>
                <Table hover responsive className="align-middle">
                    <thead className="table-success text-dark">
                        <tr>
                            <th>Sem</th>
                            <th>Subject</th>
                            <th>Assigned Faculty</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignedSubjects.length > 0 ? (
                            assignedSubjects.map((assignment, index) => (
                                <tr key={index}>
                                    <td><Badge bg="secondary">Sem {assignment.semester}</Badge></td>
                                    <td className="fw-bold">{assignment.subjectName}</td>
                                    <td>
                                        <Badge bg="info" className="text-dark">
                                            {assignment.facultyName}
                                        </Badge>
                                    </td>
                                    <td className="text-center">
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm" 
                                            className="rounded-circle border-0"
                                            onClick={() => handleDeleteAssignment(assignment.subjectId, assignment.semester, assignment.subjectName)}
                                        >
                                            <i className="bi bi-trash-fill fs-5"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center text-muted py-4">No subjects assigned yet.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            <NotificationToast show={showToast} setShow={setShowToast} message={message} />
        </div>
    );
}

export default ManageSubjectsBody;

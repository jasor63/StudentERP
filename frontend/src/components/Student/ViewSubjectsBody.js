import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Form, Row, Col } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';

function ViewSubjectsBody() {
    const [subjects, setSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('1'); // Default to semester 1 or current
    const [semesters, setSemesters] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            const decoded = jwtDecode(token);
            fetchAssignedSubjects(decoded.id);
        }
    }, []);

    const fetchAssignedSubjects = async (studentId) => {
        try {
            const response = await fetch(`http://localhost:5173/api/marks/student/${studentId}`);
            const data = await response.json();
            
            // Extract unique subjects and faculties assigned via Mark records
            const assignedData = data.map(m => ({
                subject: m.subject.name,
                faculty: m.faculty ? m.faculty.name : 'N/A',
                facultyEmail: m.faculty ? m.faculty.email : 'N/A',
                semester: m.semester
            }));

            setSubjects(assignedData);
            
            // Extract unique semesters for filter
            const sems = [...new Set(assignedData.map(s => s.semester))].sort((a, b) => a - b);
            setSemesters(sems);
            
            // Default to the highest semester available as "current"
            if (sems.length > 0) {
                setSelectedSemester(sems[sems.length - 1].toString());
            }
        } catch (error) {
            console.error('Error fetching assigned subjects:', error);
        }
    };

    useEffect(() => {
        setFilteredSubjects(subjects.filter(s => s.semester === parseInt(selectedSemester)));
    }, [selectedSemester, subjects]);

    return (
        <div className="mx-5">
            <Card className="p-4 shadow border-0 rounded-4">
                <Row className="mb-4 align-items-center">
                    <Col md={6}>
                        <h5 className="mb-0 text-muted">Course Curriculum</h5>
                    </Col>
                    <Col md={6} className="d-flex justify-content-end">
                        <Form.Group className="d-flex align-items-center">
                            <Form.Label className="me-2 mb-0">Semester:</Form.Label>
                            <Form.Select 
                                style={{ width: '120px' }}
                                value={selectedSemester} 
                                onChange={(e) => setSelectedSemester(e.target.value)}
                            >
                                {semesters.map(s => <option key={s} value={s}>Sem {s}</option>)}
                                {semesters.length === 0 && <option value="1">Sem 1</option>}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Table hover responsive className="align-middle">
                    <thead className="table-success text-dark">
                        <tr>
                            <th>#</th>
                            <th>Subject Name</th>
                            <th>Assigned Faculty</th>
                            <th>Faculty Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubjects.length > 0 ? (
                            filteredSubjects.map((s, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className="fw-semibold">{s.subject}</td>
                                    <td>
                                        <Badge bg="info" className="text-dark">
                                            {s.faculty}
                                        </Badge>
                                    </td>
                                    <td className="text-muted small">{s.facultyEmail}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center text-muted py-4">No subjects assigned for this semester.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
}

export default ViewSubjectsBody;

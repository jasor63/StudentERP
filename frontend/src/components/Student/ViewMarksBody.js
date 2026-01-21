import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Form, Row, Col } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';

function ViewMarksBody() {
    const [marks, setMarks] = useState([]);
    const [filteredMarks, setFilteredMarks] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('All');
    const [semesters, setSemesters] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            const decoded = jwtDecode(token);
            fetchMarks(decoded.id);
        }
    }, []);

    const fetchMarks = async (studentId) => {
        try {
            const response = await fetch(`http://localhost:5173/api/marks/student/${studentId}`);
            const data = await response.json();
            setMarks(data);
            
            // Extract unique semesters for filter
            const sems = [...new Set(data.map(m => m.semester))].sort((a, b) => a - b);
            setSemesters(sems);
        } catch (error) {
            console.error('Error fetching marks:', error);
        }
    };

    useEffect(() => {
        if (selectedSemester === 'All') {
            setFilteredMarks(marks);
        } else {
            setFilteredMarks(marks.filter(m => m.semester === parseInt(selectedSemester)));
        }
    }, [selectedSemester, marks]);

    return (
        <div className="mx-5">
            <Card className="p-4 shadow border-0 rounded-4">
                <Row className="mb-4 align-items-center">
                    <Col md={6}>
                        <h5 className="mb-0 text-muted">Academic Performance</h5>
                    </Col>
                    <Col md={6} className="d-flex justify-content-end">
                        <Form.Group className="d-flex align-items-center">
                            <Form.Label className="me-2 mb-0">Filter Semester:</Form.Label>
                            <Form.Select 
                                style={{ width: '120px' }}
                                value={selectedSemester} 
                                onChange={(e) => setSelectedSemester(e.target.value)}
                            >
                                <option value="All">All</option>
                                {semesters.map(s => <option key={s} value={s}>Sem {s}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Table hover responsive className="text-center align-middle">
                    <thead className="table-success text-dark">
                        <tr>
                            <th>Semester</th>
                            <th>Subject</th>
                            <th>Assigned Faculty</th>
                            <th>Marks Obtained</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMarks.length > 0 ? (
                            filteredMarks.map((m, index) => (
                                <tr key={index}>
                                    <td><Badge bg="secondary">Semester {m.semester}</Badge></td>
                                    <td className="text-start ps-4">{m.subject.name}</td>
                                    <td>{m.faculty ? m.faculty.name : <span className="text-muted">N/A</span>}</td>
                                    <td><span className="fw-bold">{m.marks}</span> / 100</td>
                                    <td>
                                        {m.marks >= 40 ? (
                                            <Badge bg="success" pill>Pass</Badge>
                                        ) : (
                                            <Badge bg="danger" pill>Fail</Badge>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-muted py-4">No mark records found.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>

                {filteredMarks.length > 0 && (
                    <div className="mt-4 p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
                        <span className="text-muted">Total Subjects: {filteredMarks.length}</span>
                        <span className="fw-bold">
                            Average: {(filteredMarks.reduce((acc, curr) => acc + curr.marks, 0) / filteredMarks.length).toFixed(2)}%
                        </span>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default ViewMarksBody;

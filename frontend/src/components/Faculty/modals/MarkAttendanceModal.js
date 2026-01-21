import { useState, useEffect } from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';

function MarkAttendanceModal({ show, handleClose, students, selectedDate, selectedCourse, setMessage, handleShowToast }) {
    const [loading, setLoading] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);

    const handleSearchChange = (e) => {
        setSearchEmail(e.target.value);
    };

    const handleCheckboxChange = (studentId) => {
        setSelectedStudents((prevSelected) => {
            if (prevSelected.includes(studentId)) {
                return prevSelected.filter((id) => id !== studentId);
            } else {
                return [...prevSelected, studentId];
            }
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const updates = students.map(student => ({
                studentId: student._id,
                status: selectedStudents.includes(student._id) ? 'Present' : 'Absent'
            }));

            const response = await fetch(`http://localhost:5173/api/students/update-attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    updates,
                    date: selectedDate,
                    courseId: selectedCourse
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update attendance');
            }

            setMessage("Attendance marked successfully");
            handleShowToast();
            setLoading(false);
            setSelectedStudents([]);
            handleClose();
        } catch (error) {
            console.error(error);
            setMessage("Failed to mark attendance");
            handleShowToast();
            setLoading(false);
        }
    };





    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Mark Attendance</Modal.Title>
            </Modal.Header>
            <Form noValidate onSubmit={handleSubmit}>
                <Modal.Body className='px-1 py-1'>
                    <div className="m-2 mt-0 p-4">
                        <Form>
                            <Form.Group controlId="searchEmail">
                                <Form.Label>Search by Email</Form.Label>
                                <div className="input-group">
                                    <Form.Control
                                        className=''
                                        type="email"
                                        placeholder="Enter student's email"
                                        value={searchEmail}
                                        onChange={handleSearchChange}
                                    />
                                    <button className="btn btn-success" type="button">Search</button>
                                </div>
                            </Form.Group>
                        </Form>
                        <div className="mt-3 border border-2 rounded-2 scrollable-container" style={{ height: "22rem", overflowY: 'auto' }}>
                            {students
                                .sort((a, b) => a.email.localeCompare(b.email))
                                .map(student => (
                                    <div
                                        className='d-flex bg-hover-div'
                                        key={student._id}
                                        role='button'
                                    >
                                        <Row className="w-100" onClick={() => handleCheckboxChange(student._id)}>
                                            <Col xs={1} className="pt-4">
                                                <Form.Check
                                                    className='px-3'
                                                    type="checkbox"
                                                    id={student._id}
                                                    onChange={() => handleCheckboxChange(student._id)}
                                                    checked={selectedStudents.includes(student._id)}
                                                ></Form.Check>
                                            </Col>
                                            <Col xs={6} className="p-4">
                                                <p className="px-3 mb-0 fw-bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.name}</p>
                                            </Col>
                                            <Col xs={5} className="pt-3">
                                                <p className="mb-0 text-muted overflow-auto">{student.email}</p>
                                            </Col>
                                        </Row>
                                    </div>
                                ))}

                        </div>
                    </div >
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="success" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Mark Attendance'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

export default MarkAttendanceModal;

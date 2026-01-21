import React, { useState, useEffect } from 'react';

import Card from "react-bootstrap/Card";
import { Col, Row } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import ManageAttendanceImage from "../../assets/ManageAttendanceImage.png";
import TotalLectureImage from "../../assets/TotalLectureImage.png";
import MarkAttendanceModal from './modals/MarkAttendanceModal';
import NotificationToast from '../NotificationToast';

function ManageAttendanceBody() {
    const [searchEmail, setSearchEmail] = useState('');
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [totalAttendance, setTotalAttendance] = useState(0);
    const [modalUpdated, setModalUpdated] = useState(false);
    const [message, setMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    const handleShowToast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);

    const handleShowMarkAttendanceModal = () => { setShowMarkAttendanceModal(true); };
    const handleCloseMarkAttendanceModal = () => {
        setShowMarkAttendanceModal(false);
        setModalUpdated(!modalUpdated);
    };
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCourse, setSelectedCourse] = useState('');

    const handleSearchChange = (e) => {
        setSearchEmail(e.target.value);
    };

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch("http://localhost:5173/api/students");
                if (!response.ok) {
                    throw new Error('Failed to fetch students');
                }
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchStudents();
    }, [modalUpdated]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch("http://localhost:5173/api/courses");
                if (!response.ok) {
                    throw new Error('Failed to fetch courses');
                }
                const data = await response.json();
                setCourses(data);
                if (data.length > 0) setSelectedCourse(data[0]._id);
            } catch (error) {
                console.error(error);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        const filtered = students.filter(student => 
            student.email.includes(searchEmail) && 
            (selectedCourse ? student.course._id === selectedCourse : true)
        );
        setFilteredStudents(filtered.map(student => ({
            ...student,
            courseName: courses.find(course => course._id === (student.course._id || student.course))?.name
        })));
    }, [searchEmail, students, courses, selectedCourse]);

    const calculateAttendancePercentage = (student) => {
        // This will be replaced or simplified since we now have historical data
        return "N/A"; 
    };

    return (
        <div className="d-flex justify-content-center">
            <div>
                <div className="d-flex mx-5">
                    <Card
                        className="m-3 p-3 shadow align-items-center pe-auto"
                        style={{ width: "18rem" }}
                        onMouseEnter={(e) => e.target.classList.add('shadow-lg')}
                        onMouseLeave={(e) => e.target.classList.remove('shadow-lg')}
                        onClick={handleShowMarkAttendanceModal}
                        role='button'
                    >
                        <Card.Img
                            className="p-0"
                            variant="top"
                            src={ManageAttendanceImage}
                            style={{ width: "5rem", height: "5rem" }}
                        />
                        <Card.Body className="d-flex align-items-center">
                            <div>
                                <Card.Title>Mark Attendance</Card.Title>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card
                        className="m-3 mx-5 p-3 shadow align-items-center pe-auto"
                        style={{ width: "18rem" }}
                    >
                        <Card.Img
                            className="p-0"
                            variant="top"
                            src={TotalLectureImage}
                            style={{ width: "5rem", height: "5rem" }}
                        />
                        <Card.Body className="d-flex align-items-center">
                            <div>
                                <Card.Title>History & Reports</Card.Title>
                                <Card.Text>View detailed logs</Card.Text>
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                <div className="mt-4 mx-5 p-4 pt-3 border border-3 border-success rounded-4 shadow" style={{ width: "42rem" }}>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="selectCourse">
                                    <Form.Label>Select Course</Form.Label>
                                    <Form.Select 
                                        value={selectedCourse} 
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                    >
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>{course.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="selectDate">
                                    <Form.Label>Select Date</Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        value={selectedDate} 
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group controlId="searchEmail" className="mt-3">
                            <Form.Label>Search by Email</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type="email"
                                    placeholder="Enter student's email"
                                    value={searchEmail}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </Form.Group>
                    </Form>

                    <div className='mt-3 border border-2 rounded-2 '>
                        <div className="d-flex w-100">
                            <Col xs={3} className="p-3 fw-bold">Name</Col>
                            <Col xs={3} className="p-3 fw-bold">Course</Col>
                            <Col xs={4} className="p-3 fw-bold">Email</Col>
                            <Col xs={2} className='py-3 fw-bold'>Attendance</Col>
                        </div>
                        <hr className="text-black m-0" />
                        <div className="scrollable-container" style={{ height: '160px', overflowY: 'auto' }}>
                            {filteredStudents
                                .sort((a, b) => a.email.localeCompare(b.email))
                                .map(student => (
                                    <div
                                        className='d-flex bg-hover-div'
                                        key={student._id}
                                        role='button'
                                    >
                                        <Row className="w-100">
                                            <Col xs={3} className="p-4">
                                                <p className="px-3 mb-0" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.name}</p>
                                            </Col>

                                            <Col xs={3} className="p-4">
                                                <p className="mb-0 text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.course.name}</p>
                                            </Col>
                                            <Col xs={4} className="pt-3">
                                                <p className="mb-0 text-muted overflow-auto">{student.email}</p>
                                            </Col>
                                            <Col xs={2} className="p-4">
                                                <p className="mb-0 text-muted">{calculateAttendancePercentage(student.attendance)}%</p>
                                            </Col>
                                        </Row>
                                    </div>
                                ))}
                        </div>
                    </div >
                </div>
                <MarkAttendanceModal 
                    show={showMarkAttendanceModal} 
                    handleClose={handleCloseMarkAttendanceModal} 
                    students={filteredStudents} 
                    selectedDate={selectedDate} 
                    selectedCourse={selectedCourse} 
                    setMessage={setMessage} 
                    handleShowToast={handleShowToast} 
                />

                <NotificationToast show={showToast} setShow={setShowToast} message={message} />
            </div>
        </div>
    )
}

export default ManageAttendanceBody
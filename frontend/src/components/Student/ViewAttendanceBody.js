import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

import { Col, Row } from 'react-bootstrap';
import ManageAttendanceImage from "../../assets/ManageAttendanceImage.png";
import TotalLectureImage from "../../assets/TotalLectureImage.png";
import Card from "react-bootstrap/Card";
import NotificationToast from '../NotificationToast';

function ViewAttendanceBody() {
    const [student, setStudent] = useState({});
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ attended: 0, total: 0 });
    const [showToast, setShowToast] = useState(false);
    const [message, setMessage] = useState('');

    const handleShowToast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };


    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("jwt");

            if (token) {
                const decodedToken = jwtDecode(token);
                const { id } = decodedToken;
                try {
                    // Fetch attendance history
                    const historyResponse = await fetch(`http://localhost:5173/api/students/${id}/attendance-history`);
                    if (historyResponse.ok) {
                        const historyData = await historyResponse.json();
                        setHistory(historyData);
                        
                        // Calculate stats
                        const attended = historyData.filter(record => record.status === 'Present').length;
                        const total = historyData.length;
                        setStats({ attended, total });
                    }

                    // Fetch student details (for name/email if needed)
                    const studentResponse = await fetch(`http://localhost:5173/api/students/${id}`);
                    if (studentResponse.ok) {
                        const studentData = await studentResponse.json();
                        setStudent(studentData);
                    }
                } catch (error) {
                    setMessage("Something went wrong");
                    handleShowToast();
                    console.error('Error fetching data:', error);
                }
            }
        };
        fetchData();
    }, []);

    const calculateAttendancePercentage = () => {
        if (stats.total === 0) return 0;
        return ((stats.attended / stats.total) * 100).toFixed(2);
    };


    return (
        <div className="d-flex justify-content-center">
            <div>
                <div className="d-flex mx-5 justify-content-center">
                    <Card
                        className="m-3 p-3 shadow align-items-center pe-auto"
                        style={{ width: "18rem" }}
                    >
                        <Card.Img
                            className="p-0"
                            variant="top"
                            src={ManageAttendanceImage}
                            style={{ width: "5rem", height: "5rem" }}
                        />
                        <Card.Body className="d-flex align-items-center">
                            <div>
                                <Card.Title>Overall: {calculateAttendancePercentage()}%</Card.Title>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card
                        className="m-3 p-3 shadow align-items-center pe-auto"
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
                                <Card.Title>Attended: {stats.attended}/{stats.total}</Card.Title>
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                <div className="mt-4 mx-5 p-4 border border-3 border-success rounded-4 shadow" style={{ width: "42rem" }}>
                    <div className='mt-1 border border-2 rounded-2 '>
                        <div className="d-flex w-100">
                            <Col xs={3} className="p-3 fw-bold text-center">Date</Col>
                            <Col xs={5} className="p-3 fw-bold text-center">Course</Col>
                            <Col xs={4} className="p-3 fw-bold text-center">Status</Col>
                        </div>
                        <hr className="text-black m-0" />
                        <div className="scrollable-container" style={{ height: '300px', overflowY: 'auto' }}>
                            {history.length > 0 ? history.map((record) => (
                                <div
                                    className='d-flex bg-hover-div border-bottom'
                                    key={record._id}
                                >
                                    <Row className="w-100">
                                        <Col xs={3} className="p-3 text-center">
                                            <p className="mb-0 text-muted">{new Date(record.date).toLocaleDateString()}</p>
                                        </Col>
                                        <Col xs={5} className="p-3 text-center">
                                            <p className="mb-0 text-muted">{record.course?.name || 'N/A'}</p>
                                        </Col>
                                        <Col xs={4} className="p-3 text-center">
                                            <span className={`badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>
                                                {record.status}
                                            </span>
                                        </Col>
                                    </Row>
                                </div>
                            )) : (
                                <div className="p-4 text-center text-muted">No attendance records found.</div>
                            )}
                        </div>
                    </div >
                </div>

                <NotificationToast show={showToast} setShow={setShowToast} message={message} />
            </div>
        </div>
    )
}

export default ViewAttendanceBody;
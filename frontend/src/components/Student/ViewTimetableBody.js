import React, { useEffect, useState } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { jwtDecode } from "jwt-decode";

function ViewTimetableBody() {
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const token = localStorage.getItem("jwt");
                if (!token) throw new Error("Not authenticated");
                
                const decodedToken = jwtDecode(token);
                const { id } = decodedToken;

                const response = await fetch(`http://localhost:5173/api/timetable/student/${id}`);
                
                if (response.status === 404) {
                    setTimetable(null);
                } else if (!response.ok) {
                    throw new Error('Failed to fetch timetable');
                } else {
                    const data = await response.json();
                    setTimetable(data);
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                <Spinner animation="border" variant="success" />
            </div>
        );
    }

    if (error && error !== "Not authenticated") {
        return (
            <div className="mx-5">
                <Alert variant="danger">Error: {error}</Alert>
            </div>
        );
    }

    return (
        <div className="mx-5">
            {timetable ? (
                <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
                    <Card.Header className="bg-success text-white text-center py-3">
                        <h5 className="mb-0">{timetable.title}</h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <img 
                            src={`http://localhost:5173${timetable.imageUrl}`} 
                            alt="Student Timetable" 
                            className="img-fluid w-100"
                            style={{ objectFit: 'contain', maxHeight: '70vh' }}
                        />
                    </Card.Body>
                    <Card.Footer className="text-muted text-center small py-2">
                        Uploaded on: {new Date(timetable.createdAt).toLocaleDateString()}
                    </Card.Footer>
                </Card>
            ) : (
                <Card className="text-center p-5 border-0 shadow-sm rounded-4" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="mb-4">
                        <i className="bi bi-calendar-x text-muted" style={{ fontSize: '5rem' }}></i>
                    </div>
                    <h3 className="text-muted">Timetable Not Allotted</h3>
                    <p className="text-muted">Please contact the administration if you believe this is an error.</p>
                </Card>
            )}
        </div>
    );
}

export default ViewTimetableBody;

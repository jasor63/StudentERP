import React, { useEffect, useState } from 'react';
// eslint-disable-next-line
import { Col, Form, Button, ListGroup, Card } from 'react-bootstrap';
import NotificationToast from '../NotificationToast';

function UploadTimetableBody() {
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [timetableHistory, setTimetableHistory] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

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
        fetchTimetableHistory();
    }, []);

    const fetchTimetableHistory = async () => {
        try {
            const response = await fetch("http://localhost:5173/api/timetable/");
            if (response.ok) {
                const data = await response.json();
                setTimetableHistory(data);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const handleStudentToggle = (studentId) => {
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        } else {
            setSelectedStudents([...selectedStudents, studentId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === filteredStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s._id));
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedStudents.length === 0 || !file || !title) {
            setMessage("Please fill all fields (Title, Students, File).");
            setShowToast(true);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('timetable', file);
        formData.append('studentIds', JSON.stringify(selectedStudents));

        try {
            const response = await fetch("http://localhost:5173/api/timetable/upload", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                setMessage("Timetable uploaded successfully!");
                setSelectedStudents([]);
                setFile(null);
                setTitle('');
                fetchTimetableHistory();
                // Reset file input manually if needed
                e.target.reset();
            } else {
                setMessage("Failed to upload timetable.");
            }
            setShowToast(true);
        } catch (error) {
            console.error(error);
            setMessage("Error uploading timetable.");
            setShowToast(true);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this timetable?")) return;
        try {
            const response = await fetch(`http://localhost:5173/api/timetable/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setMessage("Timetable deleted successfully.");
                fetchTimetableHistory();
            } else {
                setMessage("Failed to delete timetable.");
            }
            setShowToast(true);
        } catch (error) {
            console.error(error);
            setMessage("Error deleting timetable.");
            setShowToast(true);
        }
    };

    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="mx-5">
            <Card className="p-4 border-success border-2 rounded-4 shadow-sm">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">1. Timetable Title</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="e.g., 2nd Year MSc IT Timetable" 
                            className="mb-2"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">2. Select Students</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Search students..." 
                            className="mb-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-muted small">{selectedStudents.length} students selected</span>
                            <Button variant="outline-success" size="sm" onClick={handleSelectAll}>
                                {selectedStudents.length === filteredStudents.length ? "Deselect All" : "Select All Filtered"}
                            </Button>
                        </div>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="border rounded p-2">
                            <ListGroup>
                                {filteredStudents.map(student => (
                                    <ListGroup.Item 
                                        key={student._id} 
                                        className="d-flex justify-content-between align-items-center"
                                        action
                                        onClick={() => handleStudentToggle(student._id)}
                                        active={selectedStudents.includes(student._id)}
                                        variant={selectedStudents.includes(student._id) ? "success" : "light"}
                                    >
                                        <div>
                                            <div className="fw-bold">{student.name}</div>
                                            <div className="small text-muted">{student.email}</div>
                                        </div>
                                        {selectedStudents.includes(student._id) && <i className="bi bi-check-circle-fill"></i>}
                                    </ListGroup.Item>
                                ))}
                                </ListGroup>
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">3. Upload Timetable Image</Form.Label>
                        <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                    </Form.Group>

                    <Button variant="success" type="submit" className="w-100 py-2 fs-5 shadow-sm">
                        Upload Timetable
                    </Button>
                </Form>
            </Card>

            <div className="mt-5 mb-5">
                <h5 className="text-success fw-bold mb-3">Last Uploads</h5>
                {timetableHistory.length > 0 ? (
                    <div className="border rounded-4 bg-white shadow-sm overflow-hidden">
                        <ListGroup variant="flush">
                            {timetableHistory.map((item) => (
                                <ListGroup.Item key={item._id} className="p-3 d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                        <div className="fw-bold fs-5 text-dark">{item.title}</div>
                                        <div className="text-muted small mb-2">
                                            Uploaded on: {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="d-flex flex-wrap gap-1">
                                            {item.studentIds.map(s => (
                                                <span key={s._id} className="badge bg-light text-success border border-success-subtle">
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="ms-3 d-flex flex-column align-items-end">
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm" 
                                            onClick={() => handleDelete(item._id)}
                                            className="mb-2"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                        <a 
                                            href={`http://localhost:5173${item.imageUrl}`} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="btn btn-outline-info btn-sm"
                                        >
                                            <i className="bi bi-eye"></i>
                                        </a>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                ) : (
                    <div className="text-center p-4 border rounded-4 text-muted bg-light">
                        No previous uploads found.
                    </div>
                )}
            </div>

            <NotificationToast show={showToast} setShow={setShowToast} message={message} />
        </div>
    );
}

export default UploadTimetableBody;

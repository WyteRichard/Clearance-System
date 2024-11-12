import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import styles from '../../styles/DepartmentClearanceRequest.module.css';
import homeIcon from '../../assets/home.png';
import requestIcon from '../../assets/bnotes.png';
import clearedtoggle from '../../assets/clearedtoggle.svg';
import pendingtoggle from '../../assets/pendingtoggle.svg';
import avatar from '../../assets/avatar2.png';

const SpiritualAffairsClearanceRequest = () => {
    const departmentId = 10;
    const [clearanceRequests, setClearanceRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [yearLevelFilter, setYearLevelFilter] = useState("");
    const [courseFilter, setCourseFilter] = useState("");
    const [yearLevels, setYearLevels] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [currentSemester, setCurrentSemester] = useState("Loading...");
    const [currentAcademicYear, setCurrentAcademicYear] = useState("Loading...");
    const [showModal, setShowModal] = useState(false);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
    const [transactionLogs, setTransactionLogs] = useState([]);
    
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        const exp = localStorage.getItem('exp');
        const currentTime = new Date().getTime();

        if (!role || role !== 'ROLE_ROLE_SPIRITUAL' || !exp || exp * 1000 < currentTime) {
            handleLogout();
        } else {
            fetchSemesterData();
            fetchClearanceRequests();
            fetchFilters();
        }
    }, []);

    const fetchSemesterData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/Admin/semester/current', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setCurrentSemester(response.data.currentSemester);
            setCurrentAcademicYear(response.data.academicYear);
        } catch (error) {
            console.error("Error fetching semester data:", error);
        }
    };

    const fetchClearanceRequests = async () => {
        try {
            const departmentId = 10;
            const token = localStorage.getItem('token');
            const requestResponse = await axios.get(`http://localhost:8080/Requests/department/${departmentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
    
            const requestsData = requestResponse.data || [];
            const requestsWithRemarks = await Promise.all(
                requestsData.map(async (request) => {
                    try {
                        const remarksResponse = await axios.get(`http://localhost:8080/Status/${request.id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        console.log(`Request ID ${request.id} status fetched:`, remarksResponse.data?.status);
                        return { ...request, remarks: remarksResponse.data?.remarks || '', status: remarksResponse.data?.status };
                    } catch (error) {
                        console.error(`Error fetching remarks for request ${request.id}:`, error);
                        return { ...request, remarks: 'Error fetching remarks', status: 'PENDING' };
                    }
                })
            );
    
            setClearanceRequests(requestsWithRemarks);
            setFilteredRequests(requestsWithRemarks);
        } catch (error) {
            console.error("Error fetching clearance requests:", error);
        }
    };

    const fetchFilters = () => {
        const token = localStorage.getItem('token');
        
        axios.get("http://localhost:8080/Year/levels", {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => setYearLevels(response.data))
        .catch(error => console.error("Error fetching year levels:", error));

        axios.get("http://localhost:8080/Course/courses", {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => setCourses(response.data))
        .catch(error => console.error("Error fetching courses:", error));
    };

    const handleFilter = useCallback(() => {
    let filtered = [...clearanceRequests];

    if (searchTerm) {
        const searchTerms = searchTerm.toLowerCase().split(/\s+/);
        filtered = filtered.filter(request => {
            const student = request.student || {};
            const fullName = `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.toLowerCase();
            return searchTerms.every(term => fullName.includes(term));
        });
    }

    if (statusFilter) {
        filtered = filtered.filter(request => request.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    if (yearLevelFilter) {
        filtered = filtered.filter(request => request.student?.yearLevel?.yearLevel === yearLevelFilter);
    }

    if (courseFilter) {
        filtered = filtered.filter(request => request.student?.course?.courseName === courseFilter);
    }

    setFilteredRequests(filtered);
    }, [clearanceRequests, searchTerm, statusFilter, yearLevelFilter, courseFilter]);

    useEffect(() => {
        handleFilter();
    }, [handleFilter]);

    const logTransaction = async (studentNumber, message) => {
        try {
            const token = localStorage.getItem('token');
            const logData = {
                studentId: studentNumber,
                departmentId: 10,
                transactionType: "Clearance Update",
                details: message,
                timestamp: new Date().toISOString()
            };
    
            console.log("Log Data:", logData);
    
            await axios.post(
                'http://localhost:8080/Status/log-transaction',
                logData,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
        } catch (error) {
            console.error("Error logging transaction:", error);
        }
    };
    
    const fetchTransactionLogs = async (studentNumber) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/Status/logs/${studentNumber}/department/${departmentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTransactionLogs(response.data);
            setIsLogsModalOpen(true);
        } catch (error) {
            console.error("Error fetching transaction logs:", error);
        }
    };
    
    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus?.toLowerCase() === "cleared" ? "PENDING" : "CLEARED";
            try {
                const token = localStorage.getItem('token');
                const response = await axios.put(`http://localhost:8080/Status/update-status/${id}`, {
                    status: newStatus
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
    
                console.log("Backend response:", response.data);
                
                if (response.status === 200) {
                    setClearanceRequests(prevRequests =>
                        prevRequests.map(request =>
                            request.id === id ? { ...request, status: newStatus } : request
                        )
                    );

                const updatedRequest = clearanceRequests.find(request => request.id === id);
                const studentNumber = updatedRequest?.student?.studentNumber;

                if (studentNumber) {
                    const message = `Status updated from ${currentStatus} to ${newStatus}`;
                    await logTransaction(studentNumber, message);
                } else {
                    console.error("Student number not found for log transaction.");
                }
            } else {
                console.error("Failed to update status on the backend.");
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };
    
    const openModal = (request) => {
        setSelectedRequest(request);
        setRemarks(request.remarks || '');
        setIsModalOpen(true);
    };
    
    const handleSaveRemarks = async () => {
        if (selectedRequest) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`http://localhost:8080/Status/update-status/${selectedRequest.id}`, {
                    status: selectedRequest.status,
                    remarks: remarks || ''
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setClearanceRequests(prevRequests =>
                    prevRequests.map(request =>
                        request.id === selectedRequest.id ? { ...request, remarks } : request
                    )
                );

                const message = `Remarks updated to: '${remarks}'`;
                console.log("Logging transaction for remarks update:", {
                    studentNumber: selectedRequest.student.studentNumber,
                    message
                });
                await logTransaction(selectedRequest.student.studentNumber, message);
                setIsModalOpen(false);
            } catch (error) {
                console.error("Error updating remarks:", error);
                alert("Failed to update remarks. Please try again.");
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
        setRemarks("");
    };

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('exp');
        navigate('/login');
    };

    return (
        <div className={styles.flexContainer}>
            <div className={styles.sidebar}>
                <div className={styles.logoContainer}>
                </div>
                <nav className={styles.nav}>
                    <button className={styles.ghostButton} onClick={() => navigate('/spiritual-dashboard')}>
                        <img src={homeIcon} alt="Dashboard" className={styles.navIcon} />
                        Dashboard
                    </button>
                    <button className={styles.whiteButton} onClick={() => navigate('/spiritual-clearance-request')}>
                        <img src={requestIcon} alt="Clearance Request" className={styles.navIcon} />
                        Clearance Request
                    </button>
                </nav>
            </div>
            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <h2 className={styles.dashboardTitle}>Spiritual Affairs Clearance Requests</h2>
                    <div className={styles.headerRight}>
                    <span className={styles.academicYear}>A.Y. {currentAcademicYear}</span>
                    <span className={styles.semesterBadge}>{currentSemester.replace('_', ' ')}</span>
                        <div className={styles.avatar} onClick={toggleModal}>
                            <img src={avatar} alt="Avatar" />
                        </div>
                        {showModal && (
                            <div className={styles.modals}>
                                <ul>
                                    <li onClick={handleLogout}>Log Out</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </header>
                <div className={styles.filterContainer}>
                    <input 
                        type="text" 
                        placeholder="Search by name" 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                    <select onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">Filter by status</option>
                        <option value="cleared">Cleared</option>
                        <option value="pending">Pending</option>
                    </select>
                    <select onChange={e => setYearLevelFilter(e.target.value)}>
                        <option value="">Filter by year level</option>
                        {yearLevels.map(level => (
                            <option key={level.yearLevelId} value={level.yearLevel}>
                                {level.yearLevel}
                            </option>
                        ))}
                    </select>
                    <select onChange={e => setCourseFilter(e.target.value)}>
                        <option value="">Filter by course</option>
                        {courses.map(course => (
                            <option key={course.courseId} value={course.courseName}>
                                {course.courseName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Year Level</th>
                                <th>Course</th>
                                <th>Status</th>
                                <th>Remarks</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map((request, index) => (
                                <tr key={index}>
                                    <td>{request.student?.studentNumber || 'N/A'}</td>
                                    <td>{`${request.student?.firstName || ''} ${request.student?.middleName || ''} ${request.student?.lastName || ''}`}</td>
                                    <td>{request.student?.yearLevel?.yearLevel || 'N/A'}</td>
                                    <td>{request.student?.course?.courseName || 'N/A'}</td>
                                    <td onClick={() => toggleStatus(request.id, request.status)}>
                                        <img 
                                            src={(request.status?.toLowerCase() === "cleared") ? clearedtoggle : pendingtoggle} 
                                            alt={request.status || 'Unknown Status'} 
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td className="remarks-cell">{request.remarks}</td>
                                    <td>
                                        <button className={styles.editButton} onClick={() => openModal(request)}>Edit</button>
                                        <button 
                                            className={styles.viewLogsButton} 
                                            onClick={() => fetchTransactionLogs(request.student?.studentNumber)}>
                                            Logs
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <Modal isOpen={isModalOpen} onRequestClose={closeModal} className={styles.modal}>
                    <h2 className={styles.modalTitle}>Edit Remarks</h2>
                    <textarea
                        className={styles.modalTextarea}
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                        placeholder="Type remarks here..."
                        rows={4}
                    />
                    <div className={styles.modalButtons}>
                        <button className={styles.saveButton} onClick={handleSaveRemarks}>Save</button>
                        <button className={styles.cancelButton} onClick={closeModal}>Cancel</button>
                    </div>
                </Modal>
            )}

            {isLogsModalOpen && (
                <Modal isOpen={isLogsModalOpen} onRequestClose={() => setIsLogsModalOpen(false)} className={styles.modal}>
                    <h2 className={styles.modalTitle}>Transaction Logs</h2>
                    <div className={styles.logsContainer}>
                        {transactionLogs.length > 0 ? (
                            transactionLogs.map((log, index) => (
                                <div key={index} className={styles.logEntry}>
                                    <p><strong>Date:</strong> {new Date(log.timestamp).toLocaleString()}</p>
                                    <p><strong>Transaction Type:</strong> {log.transactionType}</p>
                                    <p><strong>Details:</strong> {log.details}</p>
                                </div>
                            ))
                        ) : (
                            <p>No transaction logs available.</p>
                        )}
                    </div>
                    <button className={styles.closeButton} onClick={() => setIsLogsModalOpen(false)}>Close</button>
                </Modal>
            )}

        </div>
    );
};

export default SpiritualAffairsClearanceRequest;

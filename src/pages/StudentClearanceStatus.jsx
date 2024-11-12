import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/StudentClearanceStatus.module.css';
import dashIcon from '../assets/home.png';
import statusIcon from '../assets/bidcard.png';
import accountIcon from '../assets/user.png';
import printIcon from '../assets/printIcon.svg';

const StudentClearanceStatus = () => {
    const [currentSemester, setCurrentSemester] = useState("Loading...");
    const [currentAcademicYear, setCurrentAcademicYear] = useState("Loading...");
    const [clearanceStatuses, setClearanceStatuses] = useState([]);
    const [filteredStatuses, setFilteredStatuses] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [studentFirstName, setStudentFirstName] = useState('');
    const [studentMiddleName, setStudentMiddleName] = useState('');
    const [studentLastName, setStudentLastName] = useState('');
    const [logs, setLogs] = useState([]);
    const [showLogModal, setShowLogModal] = useState(false);
    const [studentNumber, setStudentNumber] = useState('');
    const [sectionName, setSectionName] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const studentId = localStorage.getItem('userId');

    useEffect(() => {
        const role = localStorage.getItem('role');
        const exp = localStorage.getItem('exp');
        const currentTime = new Date().getTime();

        if (!role || !exp || exp * 1000 < currentTime) {
            handleLogout();
        } else if (role !== "ROLE_ROLE_STUDENT") {
        } else {
            fetchSemesterData();
            fetchStudentData();
            fetchClearanceStatuses();
        }
    }, []);

    const fetchSemesterData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/Admin/semester/current', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const { currentSemester, academicYear } = response.data;
            setCurrentSemester(currentSemester);
            setCurrentAcademicYear(academicYear);
        } catch (error) {
            setError("Error fetching semester and academic year");
        }
    };

    const fetchStudentData = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/Student/students/${studentId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const { firstName, middleName, lastName, studentNumber, section } = response.data;
            setStudentFirstName(firstName);
            setStudentMiddleName(middleName);
            setStudentLastName(lastName);
            setStudentNumber(studentNumber);
            setSectionName(section.sectionName);
        } catch (error) {
        }
    };

    const fetchClearanceStatuses = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/Status/student/${studentId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            // Transform response data to an array
            const statuses = Object.values(response.data).map((status, index) => ({
                department: status.department,
                status: status.status,
                remarks: status.remarks,
            }));
            console.log("Transformed Clearance Statuses:", statuses); // Verify the transformation
            setClearanceStatuses(statuses);
            setFilteredStatuses(statuses);
        } catch (error) {
            setError("Error fetching clearance statuses");
        }
    };
           

    const fetchLogs = async (departmentName) => {
        console.log("Fetching logs for student:", studentId, "department:", departmentName); // Should now show the department name
        try {
            const response = await axios.get(`http://localhost:8080/Status/logs/${studentId}/departmentName/${departmentName}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setLogs(response.data);
            setShowLogModal(true);
        } catch (error) {
            console.error("Error fetching logs:", error.response ? error.response.data : error.message);
        }
    };
    
    
    
    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
        if (e.target.value === '') {
            setFilteredStatuses(clearanceStatuses);
        } else {
            setFilteredStatuses(clearanceStatuses.filter(status => status.status.toLowerCase() === e.target.value));
        }
    };

    const handlePrint = () => {
        const allCleared = clearanceStatuses.every(status => status.status.toLowerCase() === 'cleared');
    
        if (!allCleared) {
            alert("Finish all the clearance before proceeding to print.");
            return;
        }
    
        const printContent = document.getElementById('printable-content').innerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        
        printWindow.document.write('<html><head><title>Clearance Status</title>');
        printWindow.document.write(`
            <style>
                @media print {
                    body { font-family: Arial, sans-serif; text-align: center; }
                    .header-content { margin-bottom: 10px; text-align: center; }
                    h1, p { margin: 0; }
                    table {
                        width: 80%;
                        margin: 20px auto;
                        border-collapse: collapse;
                        border: 1px solid #ddd;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }
                    th.actions-column, td.actions-column {
                        display: none;
                    }
                }
            </style>
        `);
        printWindow.document.write('</head><body>');
        
        printWindow.document.write(`
            <div class="header-content">
                <h1>Rogationist College</h1>
                <p>Km. 53 Aguinaldo Highway, Lalaan II, Silang Cavite, 4118</p>
                <p>Tel. No.: (046) 423-8677 / 423 - 8470</p>
            </div>
        `);
        
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
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
                <nav className={styles.nav}>
                    <button className={styles.ghostButton} onClick={() => navigate('/student-dashboard')}>
                        <img src={dashIcon} alt="Dashboard" className={styles.navIcon} />
                        Dashboard
                    </button>
                    <button className={styles.whiteButton} onClick={() => navigate('/student-clearance-status')}>
                        <img src={statusIcon} alt="Status Icon" className={styles.navIcon} />
                        Clearance Status
                    </button>
                    <button className={styles.ghostButton} onClick={() => navigate('/student-account')}>
                        <img src={accountIcon} alt="Account Icon" className={styles.navIcon} />
                        Account
                    </button>
                </nav>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.header}>
                    <h2 className={styles.dashboardTitle}>Clearance Status</h2>
                    <div className={styles.headerRight}>
                        <span className={styles.academicYear}>A.Y. {currentAcademicYear}</span>
                        <span className={styles.semesterBadge}>{currentSemester.replace('_', ' ')}</span>
                    </div>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={`${styles.studentInfo} ${styles.invisible}`}>
                    <h2>STUDENT CLEARANCE</h2>
                    <h3>{currentSemester}</h3>
                    <p>A.Y. {currentAcademicYear}</p>
                    <h3>Name: {studentFirstName} {studentMiddleName} {studentLastName}</h3>
                    <p>Student Number: {studentNumber}</p>
                    <p>Section: {sectionName}</p>
                </div>

                <div className={styles.filterContainer}>
                    <select className={styles.filterButton} value={statusFilter} onChange={handleFilterChange}>
                        <option value="">All</option>
                        <option value="cleared">Cleared</option>
                        <option value="pending">Pending</option>
                    </select>
                    <button className={styles.printButton} onClick={handlePrint}>
                        <img src={printIcon} alt="Print Clearance" />
                        Print Clearance
                    </button>
                </div>

                <div id="printable-content" className={styles.tableContainer}>
                    <div className={styles.printHeader}>
                    </div>

                <div className={`${styles.studentInfo} ${styles.invisible}`}>
                    <h2>STUDENT CLEARANCE</h2>
                    <h3>{currentSemester}</h3>
                    <p>A.Y. {currentAcademicYear}</p>
                    <h3>Name: {studentFirstName} {studentMiddleName} {studentLastName}</h3>
                    <p>Student Number: {studentNumber}</p>
                    <p>Section: {sectionName}</p>
                </div>
                    
                    <table className={styles.clearanceTable}>
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th>Status</th>
                                <th className={styles.remarksColumn}>Remarks</th>
                                <th className="actions-column">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStatuses.map((status, index) => (
                                <tr key={index}>
                                    <td>{status.department}</td>
                                    <td>{status.status}</td>
                                    <td className={styles.remarksColumn}>{status.remarks}</td>
                                    <td className="actions-column">
                                        <button onClick={() => fetchLogs(status.department)} className={styles.viewLogsButton}>
                                            View Logs
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showLogModal && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>Transaction Logs</h3>
                        <div className={styles.logsContainer}>
                            {logs.length > 0 ? (
                                logs.map((log, index) => (
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
                        <button onClick={() => setShowLogModal(false)} className={styles.closeButton}>Close</button>
                    </div>
                </div>
            )}


        </div>
    );
};

export default StudentClearanceStatus;

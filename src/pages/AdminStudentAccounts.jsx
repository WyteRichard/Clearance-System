import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AdminStudentAccounts.module.css';
import homeIcon from "../assets/home.png";
import requestIcon from "../assets/dept.png";
import checkIcon from '../assets/check.png';
import errorIcon from '../assets/error.png';
import userIcon from "../assets/buser.png";
import deleteIcon from "../assets/delete.svg";
import announcementIcon from '../assets/announcement.png';
import avatar from '../assets/avatar2.png';
import truetoggle from '../assets/cleared.png'; 
import falsetoggle from '../assets/pending.png';

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <p>{message}</p>
                <div className={styles.modalActions}>
                    <button className={styles.modalButton} onClick={onConfirm}>Yes</button>
                    <button className={styles.modalButton} onClick={onCancel}>No</button>
                </div>
            </div>
        </div>
    );
};

const AdminStudentAccounts = () => {
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState('success');
    const [students, setStudents] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchYearLevel, setSearchYearLevel] = useState("");
    const [searchCourse, setSearchCourse] = useState("");
    const [courses, setCourses] = useState([]);
    const [searchRegistrationStatus, setSearchRegistrationStatus] = useState("");
    const [yearLevels, setYearLevels] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentSemester, setCurrentSemester] = useState("Loading...");
    const [currentAcademicYear, setCurrentAcademicYear] = useState("Loading...");
    const [logins, setLogins] = useState([]);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudentNumber, setSelectedStudentNumber] = useState(null);
    const [clearanceStatuses, setClearanceStatuses] = useState({});
    const [openClearanceRow, setOpenClearanceRow] = useState(null);
    const [updatedStudents, setUpdatedStudents] = useState([]);
    const [searchSummerStatus, setSearchSummerStatus] = useState("");


    useEffect(() => {
        const role = localStorage.getItem('role');
        const exp = localStorage.getItem('exp');
        const currentTime = new Date().getTime();

        if (!role || !exp || exp * 1000 < currentTime) {
            handleLogout();
        } else if (role !== "ROLE_ROLE_ADMIN") {
            showAlert("Unauthorized access. Redirecting to login.");
            handleLogout();
        } else {
            fetchStudentData();
            fetchCourseData();
            fetchYearLevelData();
            fetchSemesterData();
            fetchLoginData();
        }
    }, []);

    useEffect(() => {
        if (students.length > 0 && logins.length > 0) {
            const newStudents = checkRegistrationStatus(students, logins);
            setUpdatedStudents(newStudents);
        }
    }, [students, logins]);   

    const fetchStudentData = async () => {
        try {
            const response = await axios.get("http://localhost:8080/Student/students", {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setStudents(response.data);
        } catch (error) {
            console.error("There was an error fetching the student data!", error);
        }
    };

    const showAlert = (message, type) => {
        setAlertMessage(message);
        setAlertType(type);
        setTimeout(() => setAlertMessage(null), 3000);
    };

    const fetchCourseData = async () => {
        try {
            const response = await axios.get("http://localhost:8080/Course/courses", {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setCourses(response.data);
        } catch (error) {
            console.error("There was an error fetching the courses!", error);
        }
    };

    const fetchYearLevelData = async () => {
        try {
            const response = await axios.get("http://localhost:8080/Year/levels", {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setYearLevels(response.data);
        } catch (error) {
            console.error("There was an error fetching the year levels!", error);
        }
    };

    const fetchSemesterData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/Admin/semester/current', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setCurrentSemester(response.data.currentSemester);
            setCurrentAcademicYear(response.data.academicYear);
        } catch (error) {
            console.error("Error fetching the current semester and academic year", error);
        }
    };

    const fetchLoginData = async () => {
        try {
            const response = await axios.get("http://localhost:8080/user/list", {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setLogins(response.data);
        } catch (error) {
            console.error("There was an error fetching the login data!", error);
        }
    };
    

    const checkRegistrationStatus = (students, logins) => {
        return students.map(student => {
            const isRegistered = logins.some(login => login.userId === student.studentNumber);
            return {
                ...student,
                registrationStatus: isRegistered ? "Registered" : "Not Registered"
            };
        });
    };

    const handleSummerToggle = async (student) => {
        const updatedSummerStatus = !student.summer;
        setStudents(prevStudents =>
            prevStudents.map(stud =>
                stud.studentNumber === student.studentNumber
                    ? { ...stud, summer: updatedSummerStatus }
                    : stud
            )
        );
    
        try {
            await axios.put(
                `http://localhost:8080/Student/student/${student.studentNumber}/summer`,
                null,
                {
                    params: { summer: updatedSummerStatus },
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );

            console.log("Summer status updated successfully on the backend.");
    
        } catch (error) {
            console.error("Error updating summer status on the backend:", error);
    
            setStudents(prevStudents =>
                prevStudents.map(stud =>
                    stud.studentNumber === student.studentNumber
                        ? { ...stud, summer: student.summer }
                        : stud
                )
            );

            const serverMessage = error.response?.data?.message || "Failed to update summer status.";
            showAlert(`Error: ${serverMessage}`, 'error');
        }
    };
    
    
    

    const handleDeleteClick = (studentNumber) => {
        setSelectedStudentNumber(studentNumber);
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!selectedStudentNumber) return;
    
        console.log("Attempting to delete all related clearance requests and statuses for student:", selectedStudentNumber);
    
        axios.delete(`http://localhost:8080/Requests/student/${selectedStudentNumber}/all`, {
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
        })
        .catch((error) => {
            if (error.response && error.response.status === 404) {
                console.log("No related clearance requests or statuses found for deletion. Proceeding to delete the student.");
            } else {
                console.error("Error deleting clearance requests and statuses:", error.response || error.message);
            }
        })
        .then(() => {
            return axios.delete(`http://localhost:8080/Student/student/${selectedStudentNumber}`, {
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                }
            });
        })
        .then(() => {
            return axios.delete(`http://localhost:8080/user/delete/${selectedStudentNumber}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        })
        .then(() => {
            setStudents(students.filter(student => student.studentNumber !== selectedStudentNumber));
            showAlert("Student and all related records deleted successfully!", 'success');
        })
        .catch((error) => {
            if (error.response) {
                console.error("Server responded with error:", error.response);
                showAlert(`Error deleting the student: ${error.response.data.message || error.response.status}`);
            } else if (error.request) {
                console.error("No response received:", error.request);
                showAlert("No response from server. Please check the network or server status.");
            } else {
                console.error("Error setting up request:", error.message);
                showAlert("Error setting up the delete request.");
            }
        })
        .finally(() => {
            setIsModalOpen(false);
            setSelectedStudentNumber(null);
        });
    };
    

    const fetchClearanceStatuses = async (studentId) => {
        try {
            const response = await axios.get(`http://localhost:8080/Status/student/${studentId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const statuses = Object.values(response.data);
            setClearanceStatuses(prev => ({ ...prev, [studentId]: statuses }));
        } catch (error) {
            console.error("Error fetching clearance statuses", error);
        }
    };

    const toggleClearanceRow = (student) => {
        if (openClearanceRow === student.studentNumber) {
            setOpenClearanceRow(null);
        } else {
            fetchClearanceStatuses(student.studentNumber);
            setOpenClearanceRow(student.studentNumber);
        }
    };


    const handleDeleteCancel = () => {
        setIsModalOpen(false);
        setSelectedStudentNumber(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('exp');
        navigate('/login');
    };

    const filteredStudents = updatedStudents.filter(student => {
        const nameMatch = `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase().includes(searchName.toLowerCase());
        const yearMatch = searchYearLevel === "" || student.yearLevel?.yearLevel === searchYearLevel;
        const courseMatch = searchCourse === "" || student.course?.courseName === searchCourse;
        const registrationMatch = searchRegistrationStatus === "" || student.registrationStatus === searchRegistrationStatus;
        const summerMatch = searchSummerStatus === "" || String(student.summer) === searchSummerStatus;
        return nameMatch && yearMatch && courseMatch && registrationMatch && summerMatch;
    });
    
    

    const toggleModal = () => setShowModal(!showModal);

    return (
        <div className={styles.flexContainer}>
            <div className={styles.sidebar}>
                <div className={styles.logoContainer}></div>
                <nav className={styles.nav}>
                    <button className={styles.ghostButton} onClick={() => navigate('/admin-dashboard')}>
                        <img src={homeIcon} alt="Home" className={styles.navIcon} />
                        Dashboard
                    </button>
                    <button className={styles.ghostButton} onClick={() => navigate('/admin-dept-accounts')}>
                        <img src={requestIcon} alt="Department" className={styles.navIcon} />
                        Department
                    </button>
                    <button className={styles.whiteButton} onClick={() => navigate('/admin-student-accounts')}>
                        <img src={userIcon} alt="Students" className={styles.navIcon} />
                        Students
                    </button>
                    <button className={styles.ghostButton} onClick={() => navigate('/admin-announcements')}>
                        <img src={announcementIcon} alt="Announcements" className={styles.navIcon} />
                        Announcements
                    </button>
                </nav>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.header}>
                    <h2 className={styles.dashboardTitle}>Student Accounts</h2>
                    <div className={styles.headerRight}>
                        <span className={styles.academicYear}>A.Y. {currentAcademicYear}</span>
                        <span className={styles.semesterBadge}>{currentSemester.replace('_', ' ')}</span>
                        <div className={styles.avatar} onClick={toggleModal}>
                            <img src={avatar} alt="Avatar" />
                        </div>
                        {showModal && (
                            <div className={styles.modal}>
                                <ul>
                                    <li onClick={handleLogout}>Log Out</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>


                {alertMessage && (
                    <div className={`${styles.alert} ${styles[alertType]}`}>
                        <div className={styles.alertTopBar}></div>
                            <div className={styles.alertContent}>
                                <img 
                                src={alertType === 'error' ? errorIcon : checkIcon}
                                alt={alertType === 'error' ? 'Error' : 'Success'} 
                                className={styles.alertIcon} 
                                />
                            <span>{alertMessage}</span>
                        <button className={styles.closeButton} onClick={() => setAlertMessage(null)}>×</button>
                    </div>
                </div>
                )}


                <div className={styles.filterContainer}>
                    <div className={styles.inputBox}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search by Name"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputBox}>
                        <select
                            className={styles.searchInput}
                            value={searchYearLevel}
                            onChange={(e) => setSearchYearLevel(e.target.value)}
                        >
                            <option value="">All Year Levels</option>
                            {yearLevels.map((yearLevel) => (
                                <option key={yearLevel.id} value={yearLevel.yearLevel}>
                                    {yearLevel.yearLevel}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.inputBox}>
                        <select
                            className={styles.searchInput}
                            value={searchCourse}
                            onChange={(e) => setSearchCourse(e.target.value)}
                        >
                            <option value="">All Courses</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.courseName}>
                                    {course.courseName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.inputBox}>
                        <select
                            className={styles.searchInput}
                            value={searchSummerStatus}
                            onChange={(e) => setSearchSummerStatus(e.target.value)}
                        >
                            <option value="">All Summer Status</option>
                            <option value="true">Enrolled in Summer</option>
                            <option value="false">Not Enrolled in Summer</option>
                        </select>
                    </div>

                    <div className={styles.inputBox}>
                        <select
                            className={styles.searchInput}
                            value={searchRegistrationStatus}
                            onChange={(e) => setSearchRegistrationStatus(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Registered">Registered</option>
                            <option value="Not Registered">Not Registered</option>
                        </select>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.clearanceTable}>
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Course</th>
                                <th>Year Level</th>
                                <th>Address</th>
                                <th>Contact Number</th>
                                <th>Email</th>
                                <th>Registration Status</th>
                                <th>Summer</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <React.Fragment key={student.studentNumber}>
                                        <tr onClick={() => toggleClearanceRow(student)}>
                                            <td>{student.studentNumber || "N/A"}</td>
                                            <td>{`${student.firstName || ""} ${student.middleName || ""} ${student.lastName || ""}`}</td>
                                            <td>{student.course?.courseName || "N/A"}</td>
                                            <td>{student.yearLevel?.yearLevel || "N/A"}</td>
                                            <td>{student.address || "N/A"}</td>
                                            <td>{student.contactNumber || "N/A"}</td>
                                            <td>{student.email || "N/A"}</td>
                                            <td>{student.registrationStatus}</td>
                                            <td>
                                                <img
                                                    src={student.summer ? truetoggle : falsetoggle}
                                                    alt="Toggle Summer"
                                                    className={`${styles.toggleIconLarge} ${styles.actionIcon}`}
                                                    onClick={() => handleSummerToggle(student)}
                                                />
                                            </td>
                                            <td>
                                                <img
                                                    src={deleteIcon}
                                                    alt="delete"
                                                    className={styles.actionIcon}
                                                    onClick={() => handleDeleteClick(student.studentNumber)}
                                                />
                                            </td>
                                        </tr>
                                        {openClearanceRow === student.studentNumber && (
                                            <tr>
                                                <td colSpan="10">
                                                    <table className={styles.clearanceTable}>
                                                        <thead>
                                                            <tr>
                                                                <th>Department</th>
                                                                <th>Status</th>
                                                                <th>Remarks</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {clearanceStatuses[student.studentNumber] ? clearanceStatuses[student.studentNumber].map(status => (
                                                                <tr key={status.clearanceType}>
                                                                    <td>{status.department}</td>
                                                                    <td>{status.status}</td>
                                                                    <td>{status.remarks || "N/A"}</td>
                                                                </tr>
                                                            )) : (
                                                                <tr>
                                                                    <td colSpan="3">No clearance request has been submitted...</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10">No students found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                message="Are you sure you want to delete this student?"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </div>
    );
};

export default AdminStudentAccounts;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import styles from "../styles/RequestClearance.module.css";
import dashIcon from '../assets/home.png';
import checkIcon from '../assets/check.png';
import errorIcon from '../assets/error.png';
import requestIcon from '../assets/bnotes.png';
import statusIcon from '../assets/idcard.png';
import accountIcon from '../assets/user.png';
import avatar from '../assets/avatar2.png';

const RequestClearance = () => {
    const [semester, setSemester] = useState("");
    const [schoolYear, setSchoolYear] = useState("");
    const [graduating, setGraduating] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [departmentId, setDepartmentId] = useState("");
    const [currentSemester, setCurrentSemester] = useState("Loading...");
    const [currentAcademicYear, setCurrentAcademicYear] = useState("Loading...");
    const [studentId, setStudentId] = useState(null);
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const navigate = useNavigate();

    const firstSemesterDepartments = [
        { id: 2, name: 'Cashier' },
        { id: 5, name: 'Dean' },
        { id: 6, name: 'Guidance' },
        { id: 8, name: 'Library' },
        { id: 9, name: 'Registrar' },
        { id: 11, name: 'Student Affairs' },
        { id: 12, name: 'Student Discipline' },
    ];

    const allDepartments = [
        { id: 1, name: 'Adviser' },
        { id: 2, name: 'Cashier' },
        { id: 3, name: 'Clinic' },
        { id: 4, name: 'Cluster Coordinator' },
        { id: 5, name: 'Dean' },
        { id: 6, name: 'Guidance' },
        { id: 7, name: 'Laboratory' },
        { id: 8, name: 'Library' },
        { id: 9, name: 'Registrar' },
        { id: 10, name: 'Spiritual Affairs' },
        { id: 11, name: 'Student Affairs' },
        { id: 12, name: 'Student Discipline' },
        { id: 13, name: 'Supreme Student Council' },
    ];

    useEffect(() => {
        const role = localStorage.getItem('role');
        const token = localStorage.getItem('token');
        const exp = localStorage.getItem('exp');
        const currentTime = new Date().getTime();

        if (!role || !exp || exp * 1000 < currentTime) {
            handleLogout();
        } else if (role !== "ROLE_ROLE_STUDENT") {
        } else {
            const studentNumber = localStorage.getItem('userId');
            if (studentNumber && token) {
                fetchStudentId(studentNumber, token);
                fetchSemesterData(token);
            } else {
                handleLogout();
            }
        }
    }, [navigate]);

    const fetchStudentId = async (studentNumber, token) => {
        try {
            const response = await axios.get(`http://localhost:8080/Student/students/${studentNumber}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStudentId(response.data.id);
        } catch (error) {
            console.error("Error fetching student ID:", error);
            handleLogout();
        }
    };

    const fetchSemesterData = async (token) => {
        try {
            const response = await axios.get('http://localhost:8080/Admin/semester/current', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const { currentSemester, academicYear } = response.data;
            setCurrentSemester(currentSemester);
            setCurrentAcademicYear(academicYear);
        } catch (error) {
            console.error("Error fetching the current semester and academic year", error);
        }
    };

    const handleSemesterChange = (e) => {
        const selectedSemester = e.target.value.toUpperCase().replace(" ", "_");
        const normalizedCurrentSemester = currentSemester.toUpperCase().replace(" ", "_");

        if (selectedSemester !== normalizedCurrentSemester) {
            setAlertMessage(`You are only allowed to choose ${currentSemester}.`);
            setAlertType("error");
            setShowAlert(true);
        } else {
            setSemester(e.target.value);
            setShowAlert(false);
        }
    };

    const handleSchoolYearChange = (e) => {
        const selectedSchoolYear = e.target.value;
        if (selectedSchoolYear !== currentAcademicYear) {
            setAlertMessage(`You are only allowed to choose the current academic year: ${currentAcademicYear}.`);
            setAlertType("error");
            setShowAlert(true);
        } else {
            setSchoolYear(selectedSchoolYear);
            setShowAlert(false);
        }
    };

    useEffect(() => {
        let timer;
        if (showAlert) {
            timer = setTimeout(() => {
                setShowAlert(false);
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [showAlert]);

    const handleGraduatingChange = (e) => {
        setGraduating(e.target.value === "Yes");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!studentId || isNaN(departmentId)) {
            setAlertMessage("Invalid student ID or department ID.");
            setAlertType("error");
            setShowAlert(true);
            return;
        }

        try {
            const existingRequestResponse = await axios.get(`http://localhost:8080/Requests/student/${studentId}/department/${departmentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (existingRequestResponse.data.length > 0) {
                setAlertMessage("You have already submitted a clearance request to this department.");
                setAlertType("error");
                setShowAlert(true);
                return;
            }
        } catch (error) {
            console.error("Error checking existing requests:", error);
            setAlertMessage("Please fill up the clearance request.");
            setAlertType("error");
            setShowAlert(true);
            return;
        }

        const clearanceRequest = {
            student: { id: studentId },
            department: { id: parseInt(departmentId, 10) },
            semester,
            schoolYear,
            graduating,
        };
        console.log("Clearance Request Payload:", clearanceRequest);

        try {
            const response = await axios.post("http://localhost:8080/Requests/add", clearanceRequest, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 201 || response.status === 200) {
                setAlertMessage("Clearance request successfully added");
                setAlertType("success");
                setShowAlert(true);
            } else {
                setAlertMessage(`Failed to add clearance request. Status code: ${response.status}`);
                setAlertType("error");
                setShowAlert(true);
            }
        } catch (error) {
            console.error("Error adding clearance request:", error);
            if (error.response) {
                console.error("Error Response Data:", error.response.data);
                setAlertMessage(`Error: ${error.response.data.message || "An error occurred. Please check the console for more details."}`);
                setAlertType("error");
                setShowAlert(true);
            } else if (error.request) {
                setAlertMessage("No response received from the server. Please check the console for more details.");
                setAlertType("error");
                setShowAlert(true);
            } else {
                setAlertMessage(`Request failed with error: ${error.message}`);
                setAlertType("error");
                setShowAlert(true);
            }
        }
    };

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    const handleProfile = () => {
        console.log("View Profile");
        navigate("/student-account");
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('exp');
        navigate('/login');
    };

    const availableDepartments = semester === "First Semester" ? firstSemesterDepartments : allDepartments;


    return (
        <div className={styles.flexContainer}>
            <div className={styles.sidebar}>
                <nav className={styles.nav}>
                    <button className={styles.ghostButton} onClick={() => navigate('/student-dashboard')}>
                        <img src={dashIcon} alt="Dashboard" className={styles.navIcon} />
                        Dashboard
                    </button>
                    <button className={styles.whiteButton} onClick={() => navigate('/request-clearance')}>
                        <img src={requestIcon} alt="Request Icon" className={styles.navIcon} />
                        Clearance Request
                    </button>
                    <button className={styles.ghostButton} onClick={() => navigate('/student-clearance-status')}>
                        <img src={statusIcon} alt="Clearance Status" className={styles.navIcon} />
                        Clearance Status
                    </button>
                    <button className={styles.ghostButton} onClick={() => navigate('/student-account')}>
                        <img src={accountIcon} alt="Account" className={styles.navIcon} />
                        Account
                    </button>
                </nav>
            </div>

            {showAlert && (
    <div className={`${styles.alert} ${alertType === "error" ? styles.error : styles.success}`}>
        <div className={styles.alertTopBar}></div>
        <div className={styles.alertContent}>
            {alertType === "success" && <img src={checkIcon} alt="Success" className={styles.alertIcon} />}
            {alertType === "error" && <img src={errorIcon} alt="Error" className={styles.alertIcon} />}
            <span>{alertMessage}</span>
            <button className={styles.closeButton} onClick={() => setShowAlert(false)}>X</button>
        </div>
    </div>
)}

            <div className={styles.mainContent}>
                <div className={styles.header}>
                    <h2 className={styles.dashboardTitle}>Clearance Request</h2>
                    <div className={styles.headerRight}>
                    <span className={styles.academicYear}>A.Y. {currentAcademicYear}</span>
                    <span className={styles.semesterBadge}>{currentSemester.replace('_', ' ')}</span>
                    <div className={styles.avatar} onClick={toggleModal}>
                            <img src={avatar} alt="Avatar" />
                        </div>
                        {showModal && (
                            <div className={styles.modal}>
                                <ul>
                                    <li onClick={handleProfile}>See Profile</li>
                                    <li onClick={handleLogout}>Log Out</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.cardGrid}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Clearance Request</h3>
                        <form onSubmit={handleSubmit}>

                            <div className={styles.inputBox}>
                                <label htmlFor="semester">Semester</label>
                                <select
                                    className={styles.filterButton}
                                    value={semester}
                                    onChange={handleSemesterChange}
                                >
                                    <option value="" disabled>Choose Semester</option>

                                    <option value="First Semester">First Semester</option>
                                    <option value="Second Semester">Second Semester</option>
                                </select>
                            </div>

                            <div className={styles.inputBox}>
                                <label htmlFor="department">Department</label>
                                <select
                                    className={styles.filterButton}
                                    value={departmentId}
                                    onChange={(e) => setDepartmentId(e.target.value)}
                                >
                                    <option value="" disabled>Choose Department</option>
                                    {availableDepartments.map(department => (
                                        <option key={department.id} value={department.id}>
                                            {department.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.inputBox}>
                                <label htmlFor="schoolYear">School Year</label>
                                <select
                                    className={styles.filterButton}
                                    value={schoolYear}
                                    onChange={handleSchoolYearChange}
                                >
                                    <option value="" disabled>Choose School Year</option>
                                    <option value="2023-2024">2023-2024</option>
                                    <option value="2024-2025">2024-2025</option>
                                    <option value="2025-2026">2025-2026</option>
                                    <option value="2026-2027">2026-2027</option>
                                </select>
                            </div>

                            <div className={styles.inputBox}>
                                <label htmlFor="graduating">Graduating ?</label>
                                <select
                                    className={styles.filterButton}
                                    value={graduating === "" ? "" : (graduating ? "Yes" : "No")}
                                    onChange={handleGraduatingChange}
                                >
                                    <option value="" disabled>
                                        Choose Status
                                    </option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                                                        
                            <div className={styles.buttonContainer}>
                                <button type="submit" className={styles.button}>
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestClearance;
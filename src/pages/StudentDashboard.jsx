import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import styles from '../styles/StudentDashboard.module.css';
import dateIcon from '../assets/calendar.png';
import dashIcon from '../assets/bhome.png';
import statusIcon from '../assets/idcard.png';
import accountIcon from '../assets/user.png';

const StudentDashboard = () => {
    const [currentSemester, setCurrentSemester] = useState("Loading...");
    const [currentAcademicYear, setCurrentAcademicYear] = useState("Loading...");
    const [clearedCount, setClearedCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [remarkCount, setRemarkCount] = useState(0);
    const [progress, setProgress] = useState(0);
    const [importantDates, setImportantDates] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const id = localStorage.getItem('userId');
        fetchStatusCounts(id);
        fetchSemesterData();
        fetchImportantDates();
    
        const role = localStorage.getItem('role');
        const exp = localStorage.getItem('exp');
        const currentTime = new Date().getTime();
    
        if (!role || !exp || exp * 1000 < currentTime) {
            handleLogout();
        } else if (role !== "ROLE_ROLE_STUDENT") {
            alert("Unauthorized access. Redirecting to login.");
            handleLogout();
        }
    }, []);

    const fetchSemesterData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/Admin/semester/current', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const { currentSemester, academicYear } = response.data;
            if (currentSemester && academicYear) {
                setCurrentSemester(currentSemester);
                setCurrentAcademicYear(academicYear);
            } else {
                setError("Failed to fetch academic year and semester.");
            }
        } catch (error) {
            setError("Error fetching the current semester and academic year");
        }
    };

    const fetchStatusCounts = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8080/Status/student/${userId}/status-counts`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            const { cleared, pending, remarks } = response.data;
            setClearedCount(cleared);
            setPendingCount(pending);
            setRemarkCount(remarks);
            const totalSteps = cleared + pending;
            setProgress(totalSteps > 0 ? (cleared / totalSteps) * 100 : 0);
        } catch (error) {
            setError("Error fetching clearance status counts");
        }
    };

    const fetchImportantDates = async () => {
        try {
            const response = await axios.get('http://localhost:8080/announcements/all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (Array.isArray(response.data)) {
                const dates = response.data.map(announcement => ({
                    title: announcement.title,
                    content: announcement.details,
                    announcementDate: new Date(announcement.announcementDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    })
                }));
                setImportantDates(dates);
            } else {
                setError("Failed to fetch announcements.");
            }
        } catch (error) {
            setError("Error fetching announcements");
        }
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
                    <button className={styles.whiteButton} onClick={() => navigate('/student-dashboard')}>
                        <img src={dashIcon} alt="Dashboard" className={styles.navIcon} />
                        Dashboard
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

            <div className={styles.mainContent}>
                <div className={styles.header}>
                    <h2 className={styles.dashboardTitle}>Student Dashboard</h2>
                    <div className={styles.headerRight}>
                        <span className={styles.academicYear}>A.Y. {currentAcademicYear}</span>
                        <span className={styles.semesterBadge}>{currentSemester.replace('_', ' ')}</span>
                    </div>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.cardGrid}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardTitle}>Cleared</span>
                            <span className={styles.greenIcon}></span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.boldText}>{clearedCount}</div>
                            <p className={styles.smallText}>Department Approved</p>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardTitle}>Pending</span>
                            <span className={styles.yellowIcon}></span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.boldText}>{pendingCount}</div>
                            <p className={styles.smallText}>Awaiting approval</p>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardTitle}>Remarks</span>
                            <span className={styles.redIcon}></span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.boldText}>{remarkCount}</div>
                            <p className={styles.smallText}>
                                {remarkCount > 0 ? "Issues were detected" : "No issues found"}
                            </p>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardTitle}>Clearance Progress</span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.progressContainer}>
                                <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className={styles.smallText}>Overall progress: {Math.round(progress)}%</p>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardTitle}>Important Dates</span>
                        </div>
                        <div className={styles.cardContent}>
                            <ul className={styles.datesList}>
                                {importantDates.map((date, index) => (
                                    <li key={index} className={styles.dateItem}>
                                        <img src={dateIcon} alt="Date" className={styles.smallIcon} />
                                        {date.title} - {date.announcementDate}
                                        <p>{date.content}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

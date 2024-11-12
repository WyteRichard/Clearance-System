import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/DepartmentDashboard.module.css';
import dashIcon from '../../assets/bhome.png';
import requestIcon from '../../assets/notes.png';
import avatar from '../../assets/avatar2.png';

const DeanDashboard = () => {
    const [currentSemester, setCurrentSemester] = useState("Loading...");
    const [currentAcademicYear, setCurrentAcademicYear] = useState("Loading...");
    const [showModal, setShowModal] = useState(false);
    const [counts, setCounts] = useState({
        clearanceRequests: 0,
        cleared: 0,
        pending: 0,
        remarks: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        const exp = localStorage.getItem('exp');
        const currentTime = new Date().getTime();

        if (!role || role !== 'ROLE_ROLE_DEAN' || !exp || exp * 1000 < currentTime) {
            handleLogout();
        } else {
            fetchSemesterData();
            fetchCounts();
        }
    }, []);

    const fetchSemesterData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/Admin/semester/current', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setCurrentSemester(response.data.currentSemester);
            setCurrentAcademicYear(response.data.academicYear);
        } catch (error) {
            console.error("Error fetching semester data:", error);
        }
    };

    const fetchCounts = async () => {
        try {
            const departmentId = 5;
            const token = localStorage.getItem('token');
            const clearanceResponse = await axios.get(`http://localhost:8080/Requests/count?departmentId=${departmentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statusCountsResponse = await axios.get(`http://localhost:8080/Status/department/${departmentId}/status-counts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setCounts({
                clearanceRequests: clearanceResponse.data,
                cleared: statusCountsResponse.data.cleared,
                pending: statusCountsResponse.data.pending,
                remarks: counts.remarks
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        }
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
                    <button className={styles.whiteButton} onClick={() => navigate('/dean-dashboard')}>
                        <img src={dashIcon} alt="Dashboard" className={styles.navIcon} />
                        Dashboard
                    </button>
                    <button className={styles.ghostButton} onClick={() => navigate('/dean-clearance-request')}>
                        <img src={requestIcon} alt="Clearance Request" className={styles.navIcon} />
                        Clearance Request
                    </button>
                </nav>
            </div>
            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <h2 className={styles.dashboardTitle}>Dean Dashboard</h2>
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
                </header>
                <div className={styles.cardGrid}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardTitle}>Clearance Requests</span>
                            <span className={styles.greenIcon}></span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.boldText}>{counts.clearanceRequests}</div>
                            <p className={styles.smallText}>Total Requests</p>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardTitle}>Cleared</span>
                            <span className={styles.yellowIcon}></span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.boldText}>{counts.cleared}</div>
                            <p className={styles.smallText}>Department Approved</p>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardTitle}>Pending</span>
                            <span className={styles.redIcon}></span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.boldText}>{counts.pending}</div>
                            <p className={styles.smallText}>Awaiting Approval</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeanDashboard;

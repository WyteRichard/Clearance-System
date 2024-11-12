import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import homeIcon from '../assets/home.png';
import requestIcon from '../assets/dept.png';
import errorIcon from '../assets/error.png';
import userIcon from '../assets/user.png';
import checkIcon from '../assets/check.png';
import announcementIcon from '../assets/bannouncement.png';
import styles from '../styles/AdminAnnouncement.module.css';
import avatar from '../assets/avatar2.png';

const Announcement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState('success');
    const [announcementTitle, setAnnouncementTitle] = useState("");
    const [announcementDate, setAnnouncementDate] = useState("");
    const [announcementDetails, setAnnouncementDetails] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [currentSemester, setCurrentSemester] = useState("Loading...");
    const [currentAcademicYear, setCurrentAcademicYear] = useState("Loading...");
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        const exp = localStorage.getItem('exp');
        const currentTime = new Date().getTime();

        if (!role || !exp || exp * 1000 < currentTime) {
            handleLogout();
        } else if (role !== "ROLE_ROLE_ADMIN") {
            navigate('/login');
        } else {
            fetchAnnouncements();
            fetchSemesterData();
        }
    }, []);

    const fetchAnnouncements = () => {
        axios.get('http://localhost:8080/announcements/all', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(response => {
            if (Array.isArray(response.data)) {
                setAnnouncements(response.data);
            } else {
                showAlert("Failed to fetch announcements.", "error");
            }
        })
        .catch(() => {
            showAlert("Error fetching announcements.", "error");
        });
    };

    const showAlert = (message, type) => {
        setAlertMessage(message);
        setAlertType(type);
        setTimeout(() => setAlertMessage(null), 1500);
    };

    const handleSubmitAnnouncement = (e) => {
        e.preventDefault();
        
        const currentDate = new Date();
        const selectedDate = new Date(announcementDate);

        if (selectedDate < currentDate.setHours(0, 0, 0, 0)) {
            showAlert("Invalid date.", "error");
            return;
        }
    
        const announcementData = { title: announcementTitle, announcementDate, details: announcementDetails };
    
        axios.post('http://localhost:8080/announcements/add', announcementData, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(() => {
            showAlert("Announcement successfully added!", "success");
            setAnnouncementTitle("");
            setAnnouncementDate("");
            setAnnouncementDetails("");
            fetchAnnouncements();
        })
        .catch(() => {
            showAlert("Failed to add announcement.", "error");
        });
    };
    
    const handleDeleteAnnouncement = (id) => {
        axios.delete(`http://localhost:8080/announcements/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(() => {
            showAlert("Announcement successfully deleted!", "success");
            fetchAnnouncements();
        })
        .catch(() => {
            showAlert("Failed to delete announcement.", "error");
        });
    };

    const fetchSemesterData = () => {
        const token = localStorage.getItem('token');
        axios.get('http://localhost:8080/Admin/semester/current', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            setCurrentSemester(response.data.currentSemester);
            setCurrentAcademicYear(response.data.academicYear);
        })
        .catch(error => {
            console.error("Error fetching semester data", error);
        });
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
                    <button className={styles.ghostButton} onClick={() => navigate('/admin-student-accounts')}>
                        <img src={userIcon} alt="Students" className={styles.navIcon} />
                        Students
                    </button>
                    <button className={styles.whiteButton} onClick={() => navigate('/admin-announcements')}>
                        <img src={announcementIcon} alt="Announcements" className={styles.navIcon} />
                        Announcements
                    </button>
                </nav>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.header}>
                    <h2 className={styles.dashboardTitle}>Announcement</h2>
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

                <div className={styles.announcementForm}>
                    <h3>Create Announcement</h3>
                    <form onSubmit={handleSubmitAnnouncement}>
                        <label>Title</label>
                        <input
                            type="text"
                            value={announcementTitle}
                            onChange={(e) => setAnnouncementTitle(e.target.value)}
                            required
                        />
                        <label>Announcement Date</label>
                        <input
                            type="date"
                            value={announcementDate}
                            onChange={(e) => setAnnouncementDate(e.target.value)}
                            required
                        />
                        <label>Details</label>
                        <textarea
                            value={announcementDetails}
                            onChange={(e) => setAnnouncementDetails(e.target.value)}
                            required
                        />
                        <button type="submit">Submit</button>
                    </form>
                </div>

                <h3 className={styles.tableTitle}>Announcements</h3>
                <table className={styles.announcementTable}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Details</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {announcements.length === 0 ? (
                            <tr>
                                <td colSpan="4">No announcements available</td>
                            </tr>
                        ) : (
                            announcements.map((announcement) => (
                                <tr key={announcement.id}>
                                    <td>{announcement.title}</td>
                                    <td>{announcement.announcementDate}</td>
                                    <td>{announcement.details}</td>
                                    <td>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Announcement;

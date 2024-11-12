import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import styles from '../styles/AdminDeptAccounts.module.css';
import homeIcon from '../assets/home.png';
import checkIcon from '../assets/check.png';
import errorIcon from '../assets/error.png';
import requestIcon from '../assets/bdept.png';
import userIcon from '../assets/user.png';
import deleteIcon from '../assets/delete.svg';
import announcementIcon from '../assets/announcement.png';
import avatar from '../assets/avatar2.png';

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

const AdminDeptAccounts = () => {
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState('success');
    const [advisers, setAdvisers] = useState([]);
    const [cashiers, setCashiers] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [clusterCoordinators, setClusterCoordinators] = useState([]);
    const [deans, setDeans] = useState([]);
    const [guidances, setGuidances] = useState([]);
    const [laboratories, setLaboratories] = useState([]);
    const [libraries, setLibraries] = useState([]);
    const [registrars, setRegistrars] = useState([]);
    const [spiritualAffairs, setSpiritualAffairs] = useState([]);
    const [studentAffairs, setStudentAffairs] = useState([]);
    const [studentDisciplines, setStudentDisciplines] = useState([]);
    const [supremeStudentCouncils, setSupremeStudentCouncils] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedType, setSelectedType] = useState("");
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
            fetchData();
            fetchSemesterData();
        }
    }, []);

    const showAlert = (message, type) => {
        setAlertMessage(message);
        setAlertType(type);
        setTimeout(() => setAlertMessage(null), 3000);
    };

    const fetchData = () => {
        const token = localStorage.getItem('token');
        axios.get('http://localhost:8080/Dashboard/accounts', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            const {
                advisers,
                cashiers,
                clinics,
                clusterCoordinators,
                deans,
                guidances,
                laboratories,
                libraries,
                registrars,
                spiritualAffairs,
                studentAffairs,
                studentDisciplines,
                supremeStudentCouncils
            } = response.data;

            setAdvisers(advisers.map(item => ({ ...item, type: 'Adviser' })));
            setCashiers(cashiers.map(item => ({ ...item, type: 'Cashier' })));
            setClinics(clinics.map(item => ({ ...item, type: 'Clinic' })));
            setClusterCoordinators(clusterCoordinators.map(item => ({ ...item, type: 'ClusterCoordinator' })));
            setDeans(deans.map(item => ({ ...item, type: 'Dean' })));
            setGuidances(guidances.map(item => ({ ...item, type: 'Guidance' })));
            setLaboratories(laboratories.map(item => ({ ...item, type: 'Laboratory' })));
            setLibraries(libraries.map(item => ({ ...item, type: 'Library' })));
            setRegistrars(registrars.map(item => ({ ...item, type: 'Registrar' })));
            setSpiritualAffairs(spiritualAffairs.map(item => ({ ...item, type: 'SpiritualAffairs' })));
            setStudentAffairs(studentAffairs.map(item => ({ ...item, type: 'StudentAffairs' })));
            setStudentDisciplines(studentDisciplines.map(item => ({ ...item, type: 'StudentDiscipline' })));
            setSupremeStudentCouncils(supremeStudentCouncils.map(item => ({ ...item, type: 'SupremeStudentCouncil' })));
        })
        .catch(error => {
            console.error("Error fetching data", error);
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

    const getType = (entity) => {
        return entity.type || "Unknown";
    };

    const handleDeleteClick = (id, type) => {
        setSelectedId(id);
        setSelectedType(type);
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        const endpointMap = {
            'Adviser': `/Adviser/advisers/${selectedId}`,
            'Cashier': `/Cashier/cashiers/${selectedId}`,
            'Clinic': `/Clinic/clinics/${selectedId}`,
            'ClusterCoordinator': `/Cluster/coordinators/${selectedId}`,
            'Dean': `/Dean/deans/${selectedId}`,
            'Guidance': `/Guidance/guidances/${selectedId}`,
            'Laboratory': `/Laboratory/laboratories/${selectedId}`,
            'Library': `/Library/libraries/${selectedId}`,
            'Registrar': `/Registrar/registrars/${selectedId}`,
            'SpiritualAffairs': `/Spiritual/affairs/${selectedId}`,
            'StudentAffairs': `/Student/affairs/${selectedId}`,
            'StudentDiscipline': `/Prefect/prefects/${selectedId}`,
            'SupremeStudentCouncil': `/Council/councils/${selectedId}`
        };

        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8080${endpointMap[selectedType]}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(() => {
            showAlert("Account successfully deleted!", "success");
            setIsModalOpen(false);
            fetchData();
        })
        .catch(() => {
            showAlert("Failed to delete account.", "error");
        });
    };

    const handleDeleteCancel = () => {
        setIsModalOpen(false);
        setSelectedId(null);
        setSelectedType("");
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

    const filteredDepartments = [
        ...advisers,
        ...cashiers,
        ...clinics,
        ...clusterCoordinators,
        ...deans,
        ...guidances,
        ...laboratories,
        ...libraries,
        ...registrars,
        ...spiritualAffairs,
        ...studentAffairs,
        ...studentDisciplines,
        ...supremeStudentCouncils
    ].filter(person => {
        const fullName = `${person.firstName} ${person.middleName ? person.middleName + ' ' : ''}${person.lastName}`.toLowerCase();
        return (
            fullName.includes(searchTerm.toLowerCase()) &&
            (filterType ? person.type.toLowerCase() === filterType.toLowerCase() : true)
        );
    });

    return (
        <div className={styles.flexContainer}>
            <div className={styles.sidebar}>
                <div className={styles.logoContainer}>
                </div>
                <nav className={styles.nav}>
                    <button className={styles.ghostButton} onClick={() => navigate('/admin-dashboard')}>
                        <img src={homeIcon} alt="Home" className={styles.navIcon} />
                        Dashboard
                    </button>
                    <button className={styles.whiteButton} onClick={() => navigate('/admin-dept-accounts')}>
                        <img src={requestIcon} alt="Department" className={styles.navIcon} />
                        Department
                    </button>
                    <button className={styles.ghostButton} onClick={() => navigate('/admin-student-accounts')}>
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
                    <h2 className={styles.dashboardTitle}>Department Accounts</h2>
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
                            placeholder="Search by name"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputBox}>
                        <select
                            className={styles.filterButton}
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                        >
                            <option value="">Filter Type</option>
                            <option value="Adviser">Adviser</option>
                            <option value="Cashier">Cashier</option>
                            <option value="Clinic">Clinic</option>
                            <option value="ClusterCoordinator">Cluster Coordinator</option>
                            <option value="Dean">Dean</option>
                            <option value="Guidance">Guidance</option>
                            <option value="Laboratory">Laboratory</option>
                            <option value="Library">Library</option>
                            <option value="Registrar">Registrar</option>
                            <option value="SpiritualAffairs">Spiritual Affairs</option>
                            <option value="StudentAffairs">Student Affairs</option>
                            <option value="StudentDiscipline">Student Discipline</option>
                            <option value="SupremeStudentCouncil">SSC</option>
                        </select>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.clearanceTable}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Department</th>
                                <th>Name</th>
                                <th>Employee Number</th>
                                <th>Address</th>
                                <th>Contact Number</th>
                                <th>Email</th>
                                <th>Civil Status</th>
                                <th>Birthday</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDepartments.map(person => (
                                <tr key={person.id}>
                                    <td>{person.id}</td>
                                    <td>{getType(person)}</td>
                                    <td>{person.firstName} {person.middleName || ''} {person.lastName}</td>
                                    <td>{person.employeeNumber || ''} {person.adviserNumber || ''} {person.cashierNumber || ''} {person.clinicNumber || ''}
                                        {person.clusterCoordinatorNumber || ''} {person.deanNumber || ''} {person.guidanceNumber || ''} {person.laboratoryNumber || ''} 
                                        {person.libraryNumber || ''} {person.registrarNumber || ''} {person.spiritualAffairsNumber || ''} {person.studentAffairsNumber || ''} 
                                        {person.studentDisciplineNumber || ''} {person.supremeStudentCouncilNumber || ''}
                                    </td>
                                    <td>{person.address || "N/A"}</td>
                                    <td>{person.contactNumber || "N/A"}</td>
                                    <td>{person.email || "N/A"}</td>
                                    <td>{person.civilStatus || "N/A"}</td>
                                    <td>{person.birthdate ? new Date(person.birthdate).toLocaleDateString() : "N/A"}</td>
                                    <td>
                                        <img
                                            src={deleteIcon}
                                            alt="Delete"
                                            className={styles.actionIcon}
                                            onClick={() => handleDeleteClick(person.id, getType(person))}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                message="Are you sure you want to delete this account?"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </div>
    );
};

export default AdminDeptAccounts;

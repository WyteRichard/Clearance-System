import React, { useState } from 'react';
import styles from "../styles/Login.module.css";
import rcBackground1 from '../assets/rc background 1.jpg';
import user from '../assets/rc_logo.png';
import eyeclose from '../assets/eyeclose.png';
import eyeopen from '../assets/eyeopen.png';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    const [passwordShown, setPasswordShown] = useState(false);
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setUsernameError(false);
        setPasswordError(false);
    
        const userData = { username, password };
    
        try {
            const response = await axios.post('http://localhost:8080/user/login', userData);
            if (response.status === 200) {
                const token = response.headers['jwt-token'];
                const tokenDecoded = jwtDecode(token);
                const authorities = tokenDecoded.authorities || [];
    
                if (token) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('exp', tokenDecoded.exp);
                    localStorage.setItem('userId', response.data.userId);
    
                    if (authorities.includes("ROLE_ROLE_STUDENT")) {
                        const config = { headers: { Authorization: `Bearer ${token}` } };
                        const semesterResponse = await axios.get('http://localhost:8080/Admin/semester/current', config);
                        const { currentSemester } = semesterResponse.data;
    
                        if (currentSemester === 'SUMMER') {
                            const studentResponse = await axios.get(`http://localhost:8080/Student/students/${response.data.userId}`, config);
                            const { summer } = studentResponse.data;
    
                            if (!summer) {
                                setErrorMessage("Login restricted to summer-eligible students during summer semester.");
                                return;
                            }
                        }
    
                        localStorage.setItem('role', "ROLE_ROLE_STUDENT");
                        await initiateClearanceRequests(response.data.userId, currentSemester);
                        navigate('/student-dashboard');
                        window.location.reload();  // Reload page after navigation to clear sensitive data from memory
                    } else {
                        handleOtherRoles(authorities);
                        window.location.reload();  // Reload page after navigation
                    }
                }
            } else {
                handleError();
            }
        } catch (error) {
            handleError(error);
        }
    };    
    

    const handleError = (error) => {
        if (error?.response?.data) {
            const errorMessage = error.response.data.message || '';
            const status = error.response.status;
        
            if (status === 401 && errorMessage.toLowerCase().includes("locked")) {
                setErrorMessage("Your account has been locked, contact the administrator.");
            } else if (errorMessage.toLowerCase().includes("invalid username")) {
                setErrorMessage("Incorrect username");
                setUsernameError(true);
            } else if (errorMessage.toLowerCase().includes("invalid password")) {
                setErrorMessage("Incorrect password");
                setPasswordError(true);
            } else {
                setErrorMessage("Incorrect username or password");
                setUsernameError(true);
                setPasswordError(true);
            }
        } else {
            setErrorMessage("An error occurred. Please try again.");
            setUsernameError(false);
            setPasswordError(false);
        }
    };   

    const initiateClearanceRequests = async (studentNumber, currentSemester) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
    
            const studentResponse = await axios.get(`http://localhost:8080/Student/students/${studentNumber}`, config);
            const { id: studentId } = studentResponse.data;
    
            const requestExistsUrl = `http://localhost:8080/Requests/student/${studentId}/exists`;
            const requestExistsResponse = await axios.get(requestExistsUrl, config);
    
            if (requestExistsResponse.data) {
                return;
            }
    
            const semesterResponse = await axios.get('http://localhost:8080/Admin/semester/current', config);
            const { currentSemester, academicYear: schoolYear } = semesterResponse.data;
    
            const isSummerOrFirstSemester = currentSemester === 'FIRST_SEMESTER' || currentSemester === 'SUMMER';
            const clearanceRequestUrl = isSummerOrFirstSemester 
                ? 'http://localhost:8080/Requests/addSelectedRequests' 
                : 'http://localhost:8080/Requests/addRequests';
    
            const semester = currentSemester === 'SECOND_SEMESTER' ? 'Second Semester' : 'First Semester';
    
            await axios.post(clearanceRequestUrl, {
                student: { id: studentId },
                schoolYear,
                semester
            }, config);
    
            const message = `Submitted clearance request for ${semester} ${schoolYear}`;
            await sendLogsToDepartments(studentNumber, message, "Clearance Request Submission", isSummerOrFirstSemester);
        } catch (error) {
            console.error("Error initiating clearance requests:", error.response ? error.response.data : error.message);
        }
    };
    
    const sendLogsToDepartments = async (studentNumber, message, transactionType, isSummerOrFirstSemester) => {
        try {
            const token = localStorage.getItem('token');
            const config = { 
                headers: { 
                    Authorization: `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                } 
            };
    
            const specificDepartments = ["Discipline", "Library", "Cashier", "Student Affairs", "Dean", "Registrar", "Guidance"];
            
            const departmentResponse = await axios.get(`http://localhost:8080/Department/departments`, config);
            const allDepartments = departmentResponse.data;
    
            const departmentsToLog = isSummerOrFirstSemester
                ? allDepartments.filter(department => 
                    specificDepartments.some(specificDept => specificDept.toLowerCase() === department.name.toLowerCase())
                )
                : allDepartments;
    
            const currentDate = new Date();
            currentDate.setHours(currentDate.getHours() + 8);
            const adjustedTimestamp = currentDate.toISOString();
    
            const logs = departmentsToLog.map(department => ({
                studentId: studentNumber,
                departmentId: department.id,
                transactionType,
                details: message,
                timestamp: adjustedTimestamp
            }));
    
            if (logs.length === 0) {
                console.error("No departments matched for logging, skipping log submission.");
                return;
            }
    
            const response = await axios.post(
                'http://localhost:8080/Status/log-transactions-batch',
                logs,
                config
            );
    
            if (response.status === 200 || response.status === 201) {
                console.log("Transaction logs have been sent to all relevant departments.");
            } else {
                console.error("Failed to send batch logs:", response.data);
            }
        } catch (error) {
            console.error("Error sending logs to departments:", error.response ? error.response.data : error.message);
        }
    };
     

    const handleOtherRoles = (authorities) => {
        if (authorities.includes("ROLE_ROLE_ADVISER")) {
            localStorage.setItem('role', "ROLE_ROLE_ADVISER");
            navigate('/adviser-dashboard');
        } else if (authorities.includes("ROLE_ROLE_CASHIER")) {
            localStorage.setItem('role', "ROLE_ROLE_CASHIER");
            navigate('/cashier-dashboard');
        } else if (authorities.includes("ROLE_ROLE_CLINIC")) {
            localStorage.setItem('role', "ROLE_ROLE_CLINIC");
            navigate('/clinic-dashboard');
        } else if (authorities.includes("ROLE_ROLE_COORDINATOR")) {
            localStorage.setItem('role', "ROLE_ROLE_COORDINATOR");
            navigate('/cluster-dashboard');
        } else if (authorities.includes("ROLE_ROLE_DEAN")) {
            localStorage.setItem('role', "ROLE_ROLE_DEAN");
            navigate('/dean-dashboard');
        } else if (authorities.includes("ROLE_ROLE_GUIDANCE")) {
            localStorage.setItem('role', "ROLE_ROLE_GUIDANCE");
            navigate('/guidance-dashboard');
        } else if (authorities.includes("ROLE_ROLE_LABORATORY")) {
            localStorage.setItem('role', "ROLE_ROLE_LABORATORY");
            navigate('/laboratory-dashboard');
        } else if (authorities.includes("ROLE_ROLE_LIBRARY")) {
            localStorage.setItem('role', "ROLE_ROLE_LIBRARY");
            navigate('/library-dashboard');
        } else if (authorities.includes("ROLE_ROLE_REGISTRAR")) {
            localStorage.setItem('role', "ROLE_ROLE_REGISTRAR");
            navigate('/registrar-dashboard');
        } else if (authorities.includes("ROLE_ROLE_SPIRITUAL")) {
            localStorage.setItem('role', "ROLE_ROLE_SPIRITUAL");
            navigate('/spiritual-dashboard');
        } else if (authorities.includes("ROLE_ROLE_AFFAIRS")) {
            localStorage.setItem('role', "ROLE_ROLE_AFFAIRS");
            navigate('/student-affairs-dashboard');
        } else if (authorities.includes("ROLE_ROLE_DISCIPLINE")) {
            localStorage.setItem('role', "ROLE_ROLE_DISCIPLINE");
            navigate('/discipline-dashboard');
        } else if (authorities.includes("ROLE_ROLE_COUNCIL")) {
            localStorage.setItem('role', "ROLE_ROLE_COUNCIL");
            navigate('/ssc-dashboard');
        } else if (authorities.includes("ROLE_ROLE_ADMIN")) {
            localStorage.setItem('role', "ROLE_ROLE_ADMIN");
            navigate('/admin-dashboard');
        } else {
            setErrorMessage("Unauthorized role");
            navigate('/login');
        }
    };
    
    
    const togglePasswordVisibility = () => {
        setPasswordShown(!passwordShown);
    };

    return (
        <div className={styles.container} style={{ backgroundImage: `url(${rcBackground1})` }}>
            <div className={styles.loginContainer}>
                <div className={styles.leftPanel}>
                    <h2 className={styles.loginTitle}>LOGIN</h2>
                    <p>Access your Student Clearance System</p>

                    <form className={styles.form} onSubmit={handleLogin}>
                        <div className={styles.inputContainer}>
                            <i className={`${styles.inputIcon} fas fa-user`}></i>
                            <input
                                type="text"
                                placeholder="Username"
                                className={`${styles.inputField} ${usernameError ? styles.errorInput : ''}`}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.passwordContainer}>
                            <i className={`${styles.inputIcon} fas fa-lock`}></i>
                            <input
                                type={passwordShown ? "text" : "password"}
                                placeholder="Password"
                                className={`${styles.inputField} ${passwordError ? styles.errorInput : ''}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <img
                                src={passwordShown ? eyeopen : eyeclose}
                                alt="Toggle visibility"
                                className={styles.eyeIcon}  
                                onClick={togglePasswordVisibility}
                            />
                        </div>

                        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

                        <div className={styles.forgotPassword}>
                            <a href="/forgot-password">Forgot Password?</a>
                        </div>

                        <button type="submit" className={styles.loginButton}>Login</button>
                    </form>

                    <p className={styles.signupPrompt}>
                        Don't have an Account? <a href="/create-account">Click here</a>
                    </p>
                </div>

                <div className={styles.rightPanel}>
                    <img src={user} alt="Logo" className={styles.logo} />
                    <h2 className={styles.systemTitle}>Student Clearance System</h2>
                    <p>Manage your academic clearance with ease</p>
                </div>
            </div>
        </div>
    );
};

export default Login;

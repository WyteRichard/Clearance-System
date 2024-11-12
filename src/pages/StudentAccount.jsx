import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/StudentAccount.module.css';
import dashIcon from '../assets/home.png';
import statusIcon from '../assets/idcard.png';
import accountIcon from '../assets/buser.png';
import keyIcon from '../assets/key.png';
import editIcon from '../assets/editp.png';
import logout from '../assets/logout.png';

const StudentAccount = () => {
  const [student, setStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const studentNumber = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    const exp = localStorage.getItem('exp');
    const currentTime = new Date().getTime();

    if (!role || !exp || exp * 1000 < currentTime) {
      handleLogout();
    } else if (role !== "ROLE_ROLE_STUDENT") {
    } else {
      fetchStudent();
    }
  }, []);

  const fetchStudent = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/Student/students/${studentNumber}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setStudent(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('exp');
    navigate('/login');
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setFormData(student);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'birthdate') {
      const selectedDate = new Date(value);
      const currentDate = new Date();
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(currentDate.getFullYear() - 10);
  
      if (selectedDate > currentDate) {
        alert("Birthdate cannot be in the future.");
        return;
      } else if (selectedDate > tenYearsAgo) {
        alert("You are too young.");
        return;
      }
    }
  
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append("contactNumber", formData.contactNumber);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("address", formData.address || student.address);
    formDataToSend.append("religion", formData.religion || student.religion);
    formDataToSend.append("birthdate", formData.birthdate ? new Date(formData.birthdate).toISOString().split('T')[0] : student.birthdate);
    formDataToSend.append("birthplace", formData.birthplace || student.birthplace);
    formDataToSend.append("citizenship", formData.citizenship || student.citizenship);
    formDataToSend.append("civilStatus", formData.civilStatus || student.civilStatus);
    formDataToSend.append("sex", formData.sex || student.sex);
  
    try {
      const response = await axios.put(`http://localhost:8080/Student/student/${studentNumber}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setIsEditing(false);
      setStudent(response.data);
    } catch (error) {
      alert(`Update failed: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  if (!student) return <div>Loading...</div>;

  return (
    <div className={`${styles.flexContainer} ${styles.studentAccountContainer}`}>
      <div className={styles.sidebar}>
        <nav className={styles.nav}>
          <button className={styles.ghostButton} onClick={() => navigate('/student-dashboard')}>
            <img src={dashIcon} alt="Dashboard" className={styles.navIcon} />
            Dashboard
          </button>
          <button className={styles.ghostButton} onClick={() => navigate('/student-clearance-status')}>
            <img src={statusIcon} alt="Clearance Status" className={styles.navIcon} />
            Clearance Status
          </button>
          <button className={styles.whiteButton} onClick={() => navigate('/student-account')}>
            <img src={accountIcon} alt="Account" className={styles.navIcon} />
            Account
          </button>
        </nav>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h2 className={styles.dashboardTitle}>Student Account</h2>
          <div className={styles.headerButtons}>
          <button className={styles.changePasswordButton}>
            <img src={keyIcon} alt="Change Password" className={styles.icon} />
            Change Password
          </button>
            {isEditing ? (
              <>
                <button className={styles.saveButton} onClick={handleSave}>Save</button>
                <button className={styles.cancelButton} onClick={handleCancel}>Cancel</button>
              </>
            ) : (
              <button className={styles.editProfileButton} onClick={handleEdit}>
              <img src={editIcon} alt="Edit Profile" className={styles.icon} />
              Edit Profile
            </button>
            )}
          </div>
        </div>

        <div className={styles.cardContainer}>
        <div className={styles.infoCard}>
          <h3>Student Information</h3>
          <p><strong>Student ID:</strong> <span>{student.studentNumber}</span></p>
          <p><strong>Name:</strong> <span>{student.firstName} {student.middleName} {student.lastName}</span></p>
          <p><strong>Year Level:</strong> <span>{student.yearLevel?.yearLevel || 'N/A'}</span></p>
          <p><strong>Course:</strong> <span>{student.course?.courseName || 'N/A'}</span></p>
        </div>

        <div className={styles.infoCard}>
          <h3>Contact Information</h3>
          <p>
            <strong>Contact Number: </strong>
            <span>
              {isEditing ? (
                <div className={styles.fullWidth}>
                  <input 
                    type="text" 
                    name="contactNumber" 
                    style={{ width: "100%" }} 
                    value={formData.contactNumber || ''} 
                    onChange={handleChange} 
                  />
                </div>
              ) : (
                student.contactNumber
              )}
            </span>
          </p>
          <p>
            <strong>Email Address: </strong>
            <span>
              {isEditing ? (
                <div className={styles.fullWidth}>
                  <input 
                    type="email" 
                    name="email" 
                    style={{ width: "100%" }} 
                    value={formData.email || ''} 
                    onChange={handleChange} 
                  />
                </div>
              ) : (
                student.email
              )}
            </span>
          </p>
          <p>
            <strong>Address:</strong>
            <span>
              {isEditing ? (
                <div className={styles.fullWidth}>
                  <input 
                    type="text" 
                    name="address" 
                    style={{ width: "100%" }} 
                    value={formData.address || ''} 
                    onChange={handleChange} 
                  />
                </div>
              ) : (
                student.address
              )}
            </span>
          </p>
        </div>

        <div className={styles.infoCard}>
          <h3>Personal Information</h3>
          <p><strong>Religion: </strong>
            <span>
              {isEditing ? (
                <input 
                  type="text" 
                  name="religion" 
                  className={`${styles.input} ${styles.editingInput}`} 
                  value={formData.religion || ''} 
                  onChange={handleChange} 
                />
              ) : (
                student.religion
              )}
            </span>
          </p>
          <p><strong>Birthday: </strong>
            <span>
              {isEditing ? (
                <input
                  type="date"
                  name="birthdate"
                  className={`${styles.input} ${styles.editingInput}`}
                  value={formData.birthdate ? new Date(formData.birthdate).toISOString().split('T')[0] : ''}
                  max={new Date().toISOString().split('T')[0]} // Today's date as the maximum
                  onChange={handleChange}
                />
              ) : (
                formatDate(student.birthdate)
              )}
            </span>
          </p>
          <p><strong>Birthplace: </strong>
            <span>
              {isEditing ? (
                <input 
                  type="text" 
                  name="birthplace" 
                  className={`${styles.input} ${styles.editingInput}`} 
                  value={formData.birthplace || ''} 
                  onChange={handleChange} 
                />
              ) : (
                student.birthplace
              )}
            </span>
          </p>
          <p><strong>Citizenship: </strong>
            <span>
              {isEditing ? (
                <input 
                  type="text" 
                  name="citizenship" 
                  className={`${styles.input} ${styles.editingInput}`} 
                  value={formData.citizenship || ''} 
                  onChange={handleChange} 
                />
              ) : (
                student.citizenship
              )}
            </span>
          </p>
          <p><strong>Civil Status: </strong>
            <span>
              {isEditing ? (
                <input 
                  type="text" 
                  name="civilStatus" 
                  className={`${styles.input} ${styles.editingInput}`} 
                  value={formData.civilStatus || ''} 
                  onChange={handleChange} 
                />
              ) : (
                student.civilStatus
              )}
            </span>
          </p>
          <p><strong>Sex: </strong>
            <span>
              {isEditing ? (
                <select 
                  name="sex" 
                  className={`${styles.input} ${styles.editingInput}`} 
                  value={formData.sex || ''} 
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                student.sex
              )}
            </span>
          </p>
        </div>
      </div>
      <div className={styles.logoutButtonContainer}>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <img src={logout} alt="Logout" className={styles.logoutIcon} />
          Logout
        </button>
      </div>
    </div>
  </div>
  );
};

export default StudentAccount;

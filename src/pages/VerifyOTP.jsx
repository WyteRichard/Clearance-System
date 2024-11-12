import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import styles from '../styles/VerifyOTP.module.css';
import backgroundImage from '../assets/rc background 1.jpg';
import logo from '../assets/rc_logo.png';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { username, otp };
      const response = await Axios.post('http://localhost:8080/user/verify-otp', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.status === 200) {
        setMessage('OTP verified successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        alert(response.data);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsSubmitting(false);
      setMessage(
        error.response?.data?.message || 'An error occurred while processing your request.'
      );
    }
  };

  return (
    <div className={styles.container} style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className={styles.verifyContainer}>
        <div className={styles.formContainer}>
          <h2 className={styles.title}>Verify OTP</h2>
          <p>Please enter your username and OTP to proceed.</p>
          <form className={styles.form} onSubmit={handleVerify}>
            <div className={styles.inputContainer}>
              <i className={`${styles.inputIcon} fas fa-user`}></i>
              <input
                type="text"
                placeholder="Username"
                className={styles.inputField}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className={styles.inputContainer}>
              <i className={`${styles.inputIcon} fas fa-key`}></i>
              <input
                type="text"
                placeholder="OTP"
                className={styles.inputField}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className={styles.buttonContainer}>
              <button
                type="submit"
                className={styles.verifyButton}
                disabled={isSubmitting || otp.length === 0 || username.length === 0}
              >
                {isSubmitting ? 'Submitting...' : 'Verify'}
              </button>
            </div>
          </form>
          {message && <p className={styles.message}>{message}</p>}
        </div>
        <div className={styles.infoPanel}>
          <img src={logo} alt="Logo" className={styles.logo} />
          <h2 className={styles.systemTitle}>Student Clearance System</h2>
          <p>Manage your academic clearance with ease</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;

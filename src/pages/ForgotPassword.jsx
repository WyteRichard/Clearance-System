import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from "../styles/ForgotPassword.module.css";
import rcBackground1 from '../assets/rc background 1.jpg';
import user from '../assets/rc_logo.png';
import eyeclose from '../assets/eyeclose.png';
import eyeopen from '../assets/eyeopen.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [errors, setErrors] = useState({});
  const [showOtpAndPassword, setShowOtpAndPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [passwordChecked, setPasswordChecked] = useState(false);
  const [alertMessage, setAlertMessage] = useState(''); // State for alert message
  const [showAlert, setShowAlert] = useState(false); // State for alert visibility
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'otp') {
      setOtp(value);
    } else if (name === 'newPassword') {
      setNewPassword(value);
      setPasswordChecked(false);
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChars) {
      return 'Your password is weak. Please include a mix of uppercase, lowercase, numbers, and special characters.';
    }

    return ''; // No error
  };

  const handlePasswordBlur = () => {
    setPasswordChecked(true);
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        newPassword: validationError,
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, newPassword: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsButtonDisabled(true);
    setIsLoading(true);

    if (!showOtpAndPassword) {
      if (!username) {
        setErrors({ ...errors, username: 'Please put your Username.' });
        showAlertMessage('Please put your Username.');
        setShake(true); // Trigger shake effect
        setIsButtonDisabled(false);
        setIsLoading(false);
        return;
      }

      if (/[^a-zA-Z0-9]/.test(username)) {
        setErrors({ ...errors, username: 'Username must be alphanumeric.' });
        showAlertMessage('Username must be alphanumeric.');
        setShake(true); // Trigger shake effect
        setIsButtonDisabled(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post('http://localhost:8080/user/forgot-password', { username });
        if (response.status === 200) {
          setShowOtpAndPassword(true);
        } else {
          showAlertMessage('Failed to send OTP. Please check your username and try again.');
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setErrors({ ...errors, username: 'Username does not exist. Please try again.' });
          showAlertMessage('Username does not exist. Please try again.');
          setShake(true); // Trigger shake effect
        } else {
          showAlertMessage(error.response?.data?.message || 'An error occurred.');
        }
      } finally {
        setIsButtonDisabled(false);
        setIsLoading(false);
      }
    } else {
      if (!otp || !newPassword) {
        if (!otp) {
          setErrors((prevErrors) => ({ ...prevErrors, otp: 'OTP is required' }));
        }
        if (!newPassword) {
          setErrors((prevErrors) => ({ ...prevErrors, newPassword: 'Password is required' }));
        }
        showAlertMessage('Both OTP and New Password are required.');
        setShake(true); // Trigger shake effect
        setIsButtonDisabled(false);
        setIsLoading(false);
        return;
      }

      const validationError = validatePassword(newPassword);
      if (validationError) {
        setErrors((prevErrors) => ({ ...prevErrors, newPassword: validationError }));
        showAlertMessage(validationError);
        setShake(true); // Trigger shake effect
        setIsButtonDisabled(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post('http://localhost:8080/user/verify-forgot-password', {
          username,
          otp,
          password: newPassword,
        });

        if (response.status === 200) {
          navigate('/Login');
        } else {
          setErrors((prevErrors) => ({ ...prevErrors, otp: 'Incorrect OTP code.' }));
          showAlertMessage('Incorrect OTP code.');
          setShake(true); // Trigger shake effect
        }
      } catch (error) {
        if (error.response) {
          if (error.response?.status === 400 || error.response?.status === 401) {
            setErrors((prevErrors) => ({ ...prevErrors, otp: 'Incorrect OTP code.' }));
            showAlertMessage('Incorrect OTP code.');
            setShake(true); // Trigger shake effect
          } else {
            setErrors((prevErrors) => ({ ...prevErrors, otp: 'An error occurred while verifying OTP.' }));
            showAlertMessage('An error occurred while verifying OTP.');
            setShake(true); // Trigger shake effect
          }
        } else {
          showAlertMessage('An unexpected error occurred.');
        }
      } finally {
        setIsButtonDisabled(false);
        setIsLoading(false);
      }
    }
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      setAlertMessage('');
    }, 4000); // Automatically close alert after 4 seconds
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.container} style={{ backgroundImage: `url(${rcBackground1})` }}>
      <div className={styles.loginContainer}>
        <div className={styles.leftPanel}>
          <h2 className={styles.loginTitle}>{showOtpAndPassword ? "Reset Password" : "Forgot Password"}</h2>
          <p>{showOtpAndPassword ? "Please enter the OTP and your new password" : "Please enter your username to receive an OTP"}</p>
          
          {/* Error Alert Modal */}
          {showAlert && (
            <div className={styles.alertModal}>
              <div className={styles.alertModalContent}>
                <p>{alertMessage}</p>
              </div>
            </div>
          )}
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputContainer}>
              <i className={`${styles.inputIcon} fas fa-user`}></i>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={username}
                onChange={handleChange}
                className={`${styles.inputField} ${!showOtpAndPassword && shake && errors.username ? styles.shake : ''}`}
                disabled={showOtpAndPassword || isButtonDisabled}
              />
            </div>

            {isLoading && (
            <div className={styles.loadingMessage}>
              Checking username...
            </div>
          )}

            {showOtpAndPassword && (
              <>
                <div className={styles.inputContainer}>
                  <i className={`${styles.inputIcon} fas fa-key`}></i>
                  <input
                    type="text"
                    name="otp"
                    placeholder="OTP"
                    value={otp}
                    onChange={handleChange}
                    className={`${styles.inputField} ${shake && errors.otp ? styles.shake : ''}`}
                  />
                </div>
                <div className={styles.passwordContainer}>
                  <i className={`${styles.inputIcon} fas fa-lock`}></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={handleChange}
                    onBlur={handlePasswordBlur}
                    className={`${styles.inputField} ${shake && passwordChecked && errors.newPassword ? styles.shake : ''}`}
                  />
                  <img
                    src={showPassword ? eyeopen : eyeclose}
                    alt="Toggle Password Visibility"
                    className={styles.eyeIcon}
                    onClick={togglePasswordVisibility}
                  />
                </div>
              </>
            )}

            <div className={styles.buttonContainer}>
              {showOtpAndPassword && (
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowOtpAndPassword(false)}
                  disabled={isButtonDisabled}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isButtonDisabled}
              >
                {showOtpAndPassword ? 'Change Password' : 'Submit'}
              </button>
            </div>
          </form>
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

export default ForgotPassword;

import React, { useState } from 'react';
import isValidEmail from '../utils/validateEmail.js'
import Title from '../components/Title/Title.jsx';
import Button from '../components/Button/Button.jsx'
import '../styles/Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleDoneClick = () => {
    // Mock API call to check email
    // Replace with actual API call in production
    setTimeout(() => {      
      if (isValidEmail(email)) {
        setIsDone(true);
      } else {
        setHasError(true);
      }
    }, 1000);
  };

  return (
    <div className="registration-form">
      <div className="registration-form-content">
        <Title text='Create Your Profile'/>
        {isDone ? (
          <p className="registration-form-success">
            Please check your inbox for complete registration
          </p>
        ) : (
          <>
            <input
              className="registration-form-input"
              type="text"
              placeholder="Your email address"
              value={email}
              onChange={handleEmailChange}
            />
            <Button
              // className="registration-form-button"
              onClick={handleDoneClick}
            >
              Done
            </Button>
            {hasError && (
              <p className="registration-form-error">
                Something went wrong. Please try again later.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
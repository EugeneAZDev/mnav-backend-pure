import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Reset.css'
import Button from '../components/Button/Button';

const CenteredForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Redirect to the login page with the user ID in the URL
    const userId = '123'; // Replace with actual user ID
    navigate(`/login/${userId}`);
  };

  return (
    <div className="centered-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Reset Password Form</label>      
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <div className="form-group">          
          <input
            type="password"
            id="confirm-password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
        </div>
        {error && <div className="error">{error}</div>}
        <Button type="submit">Finish</Button>
      </form>
    </div>
  );
};

export default CenteredForm;

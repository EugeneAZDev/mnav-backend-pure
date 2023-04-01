import React, { useState } from 'react';
import Button from '../Button/Button'

const ConfirmEmail = ({confirm}) => {
  const [verificationCode, setVerificationCode] = useState('')

  const getVerificationCode = e => {    
    const codeFromTheServer = '555'
    console.log(`server: ${codeFromTheServer}; local: ${verificationCode}`)
    if (verificationCode !== codeFromTheServer) {      
      confirm(false)
    } else {
      // To disable Refresh form for the type='submit' button
      e.preventDefault() 
      confirm(true)
    }
  }

  return (
    <div>
      <h4>Check your email and confirm code</h4>
      <input type='text' onChange={event => setVerificationCode(event.target.value)} />
      <Button type='submit' onClick={getVerificationCode}>Verify</Button>
    </div>
  );
};

export default ConfirmEmail;
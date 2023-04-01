import React, { useState } from 'react';

const PasswordInput = ({ vLabel }) => { // v - value
  const [password, setPassword] = useState('')

  return (
    <div>
      <label>{vLabel}</label>
      <input type='password' onChange={e => setPassword(e.target.value)}/>
    </div>
  );
};

export default PasswordInput;

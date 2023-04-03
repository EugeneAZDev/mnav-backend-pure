import React, { useContext, useState } from 'react'

import { AuthContext } from '../context/auth';
import Button from '../components/Button/Button'
import Title from '../components/Title/Title'

import '../styles/Common.css'

const Login = () => {
  const { isAuth, setIsAuth } = useContext(AuthContext)
  const [error, setError] = useState('')
  
  const handleSubmit = event => {
    event.preventDefault()
    setIsAuth(true)
    localStorage.setItem('auth', 'true')
  }

  return (
    <div className='form'>
      <div className='form-content'>
        <Title text='Login Page' />
        <input
          id='login'
          type='text'
          placeholder='Email'
        />
        <input
          id='login-password'
          type='text'
          placeholder='Password'
        />
        <Button onClick={handleSubmit}>Sign in</Button>
        {error && <div className='error'>{error}</div>}
      </div>
    </div>
  )
}

export default Login

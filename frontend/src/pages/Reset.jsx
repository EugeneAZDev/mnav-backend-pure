import { useContext, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Button from '../components/Button/Button'
import Title from '../components/Title/Title'

import GlobalContext from '../context/global.js'

import '../styles/Common.css'

const Reset = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const { id } = useParams()

  const api = useContext(GlobalContext)

  const navigate = useNavigate()

  const handlePasswordChange = event => {
    setPassword(event.target.value)
  }
  const handleConfirmPasswordChange = event => {
    setConfirmPassword(event.target.value)
  }
  const handleSubmit = async (event) => {
    event.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!password || !confirmPassword) {
      return
    }

    await api.auth.register({ id, password })
    
    navigate(`/login`)
  }

  return (
    <div className='form'>
      <div className='form-content'>
        <Title text='Password Verification Form' />
          <input
            id='password'
            type='password'            
            placeholder='Password'
            value={password}
            onChange={handlePasswordChange}
          />
          <input
            id='confirm-password'
            type='password'            
            placeholder='Confirm Password'
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
          <Button onClick={handleSubmit}>Finish</Button>
          {error && <div className='error'>{error}</div>}
      </div>
    </div>
  )
}

export default Reset

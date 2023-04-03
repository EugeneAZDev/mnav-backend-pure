import React, { useContext, useState } from 'react'
import isValidEmail from '../utils/validateEmail.js'
import Button from '../components/Button/Button.jsx'
import GlobalContext from '../context/global.js'
import Title from '../components/Title/Title.jsx'

import '../styles/Common.css'
import '../styles/Register.css'

const Register = () => {
  const [email, setEmail] = useState('')
  const [isDone, setIsDone] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorText, setErrorText] = useState('')

  const api = useContext(GlobalContext)

  const handleEmailChange = event => {
    setEmail(event.target.value)
  }

  const handleDoneClick = async () => {
    setHasError(false)
    if (!email) {
      setErrorText('Empty required field')
      setHasError(true)
      return
    }
    if (isValidEmail(email)) {
      const emails = await api.user.find('email', email)
      if (emails.length > 0) {
        setErrorText('A user with this email already exists')
        setHasError(true)
      } else {
        const user = (await api.user.create({ email }))[0]
        // localhost:3000/reset/4
        const url = `localhost:3000/reset/${user.id}`
        console.log(url)
        // TODO Implement functions below:
        // 3. Send email
        setIsDone(true)
      }
    } else {
      setErrorText('Invalid Email Address')
      setHasError(true)
      return
    }
  }

  return (
    <div className='form'>
      <div className='form-content'>
        <Title text='Create Your Profile' />
        {isDone ? (
          <p className='registration-form-success'>
            Please check your inbox for complete registration
          </p>
        ) : (
          <>
            <input
              type='text'
              placeholder='email address'
              value={email}
              onChange={handleEmailChange}
            />
            <Button onClick={handleDoneClick}>Done</Button>
            {hasError && (
              <p className='error'>
                {errorText}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Register

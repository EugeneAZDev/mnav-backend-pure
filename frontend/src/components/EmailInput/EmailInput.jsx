import React, { useState } from 'react'
import './EmailInput.module.css'
import Modal from '../Modal/Modal'
import ConfirmEmail from '../ConfirmEmail/ConfirmEmail'
import isValidEmail from '../../utils/validateEmail'
// import css from './EmailInput.module.css'

const EmailInput = ({ id, vLabel, vButton = 'Confirm', confirmedEmail }) => {
  const [modal, setModal] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [email, setEmail] = useState('')
  const [noneStyle, setNoneStyle] = useState(false)

  const confirmEmail = (result) => {
    console.log(`RESULT = ${result}`)
    // console.log(id) primary or secondary id
    confirmedEmail(result)
    setConfirm(result)
    setModal(false)
  }

  const validateEmail = () => {
    if (isValidEmail(email)) {
      setModal(true)      
      setNoneStyle(true)
    }    
  }

  return (
    <div>
      <label>{vLabel}</label>
      <input type='text' onChange={e => setEmail(e.target.value)} />
      <button
        disabled={confirm}
        style={{
          background: confirm ? '#00591a' : noneStyle ? '#ff6d6d' : '',          
          color: confirm ? '#00ff00' : noneStyle ? '#820000' : ''
        }}
        onClick={() => validateEmail()}
      >
        {vButton}
      </button>
      <Modal visible={modal} setVisible={setModal}>
        <ConfirmEmail confirm={confirmEmail} />
      </Modal>
    </div>
  )
}

export default EmailInput

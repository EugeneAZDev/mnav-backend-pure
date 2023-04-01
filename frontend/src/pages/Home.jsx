import React, { useContext } from 'react';
import Button from '../components/Button/Button'
import { AuthContext } from '../context/auth'
import { useNavigate } from 'react-router-dom'
import Title from '../components/Title/Title'
import '../styles/Home.css'

const Home = () => {
  const router = useNavigate()
  const { isAuth, setIsAuth } = useContext(AuthContext)
  const login = event => {
    event.preventDefault()
    setIsAuth(true)
    localStorage.setItem('auth', 'true')
  }

  return (
    <div className='home-form'>
      <Title text='My Navigator'/>
      <div className="button-container">
        <Button onClick={() => {router('/register')}}>GET STARTED</Button>
        <Button onClick={login}>SIGN IN</Button>        
      </div>
    </div>
   )
};

export default Home;

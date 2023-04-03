import React, { useContext, useEffect, useState } from 'react'
import Router from './routers/Router'
import { AuthContext } from './context/auth'

const App = () => {
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('auth')) setIsAuth(true)
    setIsLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuth, setIsAuth, isLoading }}>
      <div>
        <Router />
      </div>
    </AuthContext.Provider>
  )
}

export default App

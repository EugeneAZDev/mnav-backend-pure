// App.js

import React, { useContext, useEffect, useState } from 'react'
import Router from './routers/Router'
// import GlobalContext from './context/global'
import { AuthContext } from './context/auth'

const App = () => {
  // const api = useContext(GlobalContext)
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('auth')) setIsAuth(true)
    setIsLoading(false)
  }, [])

  // const handleClick = async () => {
  //   const result = await api.item.read(1)
  //   console.log(result[0])
  // }

  return (
    <AuthContext.Provider value={{ isAuth, setIsAuth, isLoading }}>
      <div>
        <Router />
      </div>
    </AuthContext.Provider>
  )
}

export default App

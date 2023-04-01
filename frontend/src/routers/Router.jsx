import React, { useContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/auth'
import { privateRoutes, publicRoutes } from '../routers/routes'
import Loader from '../components/Loader/Loader'

const Router = () => {
  const { isAuth, isLoading } = useContext(AuthContext)

  if (isLoading) <Loader />

  return isAuth ? (
    <Routes>
      {privateRoutes.map(route => (
        <Route path={route.path} element={route.element} key={route.path} />
      ))}
    </Routes>
  ) : (
    <Routes>
      {publicRoutes.map(route => (
        <Route path={route.path} element={route.element} key={route.path} />
      ))}
    </Routes>
  )
}

export default Router

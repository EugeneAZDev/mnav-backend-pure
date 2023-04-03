import Home from '../pages/Home'
import Login from '../pages/Login'
import Menu from '../pages/Menu'
import Register from '../pages/Register'
import Reset from '../pages/Reset'

export const publicRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/reset/:id', element: <Reset /> },
  { path: '*', element: <Home /> }
]

export const privateRoutes = [  
  { path: '*', element: <Menu /> }
]

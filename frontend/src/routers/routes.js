import Home from '../pages/Home'
import Register from '../pages/Register'
import Reset from '../pages/Reset'

export const publicRoutes = [ 
  { path: '/register', element: <Register /> },
  { path: '/reset', element: <Reset /> },
  { path: '*', element: <Home /> }
]

export const privateRoutes = [  
  // { path: '*', element: <Menu /> }
]

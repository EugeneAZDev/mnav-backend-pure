import React, { createContext, useState, useEffect } from 'react'
import apiMethods from '../api/index'

const GlobalContext = createContext(null)

export const GlobalProvider = ({ children }) => {
  const [data, setData] = useState(null)

  useEffect(() => {
    async function fetchData () {
      const result = await apiMethods()
      setData(result)
    }
    fetchData()
  }, [])

  return (
    <GlobalContext.Provider value={data}>{children}</GlobalContext.Provider>
  )
}

export default GlobalContext

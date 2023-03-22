// App.js

import React, { useContext } from 'react'
import GlobalContext from './context/global'

const App = () => {
  const api = useContext(GlobalContext)

  const handleClick = async () => {
    const result = await api.item.read(1);
    console.log(result[0]);
  };

  return (
    <div>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}

export default App

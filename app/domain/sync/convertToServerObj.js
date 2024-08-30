(obj) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (key.startsWith('server')) {      
      const newKey = key.charAt(6).toLowerCase() + key.slice(7);
      newObj[newKey] = newObj[key];
      delete newObj[key];
    }
  });
  return newObj;
};

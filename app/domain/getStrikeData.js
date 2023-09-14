
(initial, boolData, falseName, trueName) => {
  let delay = 0
  let dateDelay = null
  let done = 0
  let dateDone = null
  const input = { ...initial }
  const minDelayCheck = () => {
    if (delay !== 0 && delay < input[`daysMin${falseName}`]) {
      input[`dateDaysMin${falseName}`] = dateDelay
      input[`daysMin${falseName}`] = delay
    }
  }

  for (const [dateString, hasValue] of Object.entries(boolData)) {
    if (hasValue) {      
      minDelayCheck()
      delay = 0
      dateDelay = null
      if (!dateDone) dateDone = dateString
      if (done !== 0) {
        done++
        input[`daysLatest${trueName}`] = done
        input[`dateDaysLatest${trueName}`] = dateDone
        if (done > input[`daysMax${trueName}`]) {
          input[`dateDaysMax${trueName}`] = dateDone
          input[`daysMax${trueName}`] = done
        }
        if (done < input[`daysMin${trueName}`]) {
          input[`dateDaysMin${trueName}`] = dateDone
          input[`daysMin${trueName}`] = done
        }
      } else done++
    } else {        
      done = 0
      dateDone = null
      if (!dateDelay) dateDelay = dateString
      if (delay !== 0) {        
        delay++
        input[`daysLatest${falseName}`] = delay
        input[`dateDaysLatest${falseName}`] = dateDelay
        if (delay > input[`daysMax${falseName}`]) {
          input[`dateDaysMax${falseName}`] = dateDelay
          input[`daysMax${falseName}`] = delay
        }        
      } else delay++
    }
  }    
  minDelayCheck()
  
  return input
}

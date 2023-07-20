export function logger(message: string, payload?: any) {
  let stringPayload
  if(payload) {
    try { 
      stringPayload = JSON.stringify(payload)
    } catch (err) {
      stringPayload = 'error on payload conversion to log'
    }
    console.log(message, stringPayload)
  } else {
    console.log(message)
  }
}
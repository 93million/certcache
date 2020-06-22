module.exports = (callback, ms) => {
  let timeout

  const promise = new Promise((resolve, reject) => {
    timeout = setTimeout(
      () => {
        try {
          resolve(callback())
        } catch (e) {
          reject(e)
        }
      },
      ms
    )
  })

  promise.clearTimeout = () => {
    clearTimeout(timeout)
  }

  return promise
}

module.exports = (callback, ms) => {
  let timeout

  const promise = new Promise((resolve) => {
    timeout = setTimeout(
      () => {
        resolve(callback())
      },
      ms
    )
  })

  promise.clearTimeout = () => {
    clearTimeout(timeout)
  }

  return promise
}

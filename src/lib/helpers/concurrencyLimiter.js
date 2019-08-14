module.exports = (fn, concurrency) => {
  const stack = []
  let inFlightNum = 0

  return function () {
    const _args = arguments

    return new Promise((resolve, reject) => {
      const callNext = () => {
        while (inFlightNum < concurrency && stack.length !== 0) {
          const callback = stack.shift()

          inFlightNum++
          callback()
        }
      }
      const complete = (val) => {
        inFlightNum--

        callNext()

        resolve(val)
      }
      const error = (val) => {
        inFlightNum--

        callNext()

        reject(val)
      }
      const callback = () => {
        fn(..._args).then(complete, error)
      }

      stack.push(callback)

      callNext()
    })
  }
}

module.exports = (fn, concurrency) => {
  const stack = []
  let inFlightNum = 0

  return function () {
    const _args = arguments

    return new Promise((resolve, reject) => {
      const callNext = () => {
        const callback = stack.shift()

        callback()
      }
      const complete = (val) => {
        inFlightNum--

        while (inFlightNum < concurrency && stack.length !== 0) {
          callNext()
        }

        resolve(val)
      }
      const error = (val) => {
        inFlightNum--

        while (inFlightNum < concurrency && stack.length !== 0) {
          callNext()
        }

        reject(val)
      }
      const callback = () => {
        inFlightNum++

        fn(..._args).then(complete, error)
      }

      stack.push(callback)

      if (inFlightNum < concurrency) {
        callNext()
      }
    })
  }
}

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
      const callback = () => {
        inFlightNum++

        return fn(..._args).then(complete)
      }

      stack.push(callback)

      if (inFlightNum < concurrency) {
        callNext()
      }
    })
  }
}

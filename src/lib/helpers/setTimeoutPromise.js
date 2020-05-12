module.exports = (callback, ms) => new Promise((resolve) => {
  setTimeout(
    async () => {
      resolve(await callback())
    },
    ms
  )
})

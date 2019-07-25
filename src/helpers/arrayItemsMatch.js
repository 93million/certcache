module.exports = (a1, a2) => {
  return (
    a1.length === a2.length &&
    a1.every((item, i) => a2.includes(item)) &&
    a2.every((item, i) => a1.includes(item))
  )
}

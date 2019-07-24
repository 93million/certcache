module.exports = (a1, a2) => (
  a1.length === a2.length && a1.every((item, i) => a2[i] === item)
)

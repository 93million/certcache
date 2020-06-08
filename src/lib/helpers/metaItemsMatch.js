module.exports = (meta1, meta2) => {
  return (JSON.stringify(meta1) === JSON.stringify(meta2))
}

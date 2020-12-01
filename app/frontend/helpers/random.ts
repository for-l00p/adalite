export const getRandomNumber = (): number => {
  const array = new Uint32Array(1)
  return crypto.getRandomValues(array)[0]
}

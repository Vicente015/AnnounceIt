
function convertHexStringToInt (hexString: string | undefined) {
  if (!hexString) return
  return Number.parseInt(hexString.slice(1), 16)
}

export default convertHexStringToInt

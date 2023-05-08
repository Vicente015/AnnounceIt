
function convertHexStringToInt (hexString: string) {
  return Number.parseInt(hexString.slice(1), 16)
}

export default convertHexStringToInt

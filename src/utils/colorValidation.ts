import { getFormat } from 'colord'

const validColorTypes = new Set(['name', 'hex', 'rbg', 'hsl', 'hsv'])
const isValidColorFormat = (color: string) => !!getFormat(color) && validColorTypes.has(getFormat(color) ?? '')

export default isValidColorFormat

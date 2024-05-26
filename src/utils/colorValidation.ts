import { extend, getFormat } from 'colord'
import namesPlugin from 'colord/plugins/names'
// @ts-expect-error is typed wrong
extend([namesPlugin])

const validColorFormats = new Set(['name', 'hex', 'rgb', 'hsl'])
const hasValidColorFormat = (color: string) => {
  const format = getFormat(color)
  return format !== undefined && validColorFormats.has(format)
}
export default hasValidColorFormat

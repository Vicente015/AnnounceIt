import { AnyObject, SchemaType, Schema } from 'mongoose'
import { HexColorString as HexColorStringType } from 'discord.js'

class HexColorString<HexColorStringType> extends SchemaType {
  constructor (key: string, options: AnyObject) {
    super(key, options, 'HexCoorString')
  }

  cast (val: string) {
    if (!val.startsWith('#')) {
      throw new Error('HexColorString: ' + val + ' is not a valid hex color string')
    }

    return val
  }
}

// @ts-expect-error
Schema.Types.HexColorString = HexColorString
export default HexColorString

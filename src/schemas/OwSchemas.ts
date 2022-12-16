import ow from 'ow'

const MaxNameLength = 16
const nameSchema = ow.string.maxLength(MaxNameLength)

export {
  MaxNameLength,
  nameSchema
}

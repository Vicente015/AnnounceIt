import { model, ObjectId, Schema, models } from 'mongoose'
import HexColorString from './HexColorStringType'
import { HexColorString as HexColorStringType } from 'discord.js'

interface Announcement {
  guildId: string
  name: string
  title?: string
  description?: string
  color?: HexColorStringType
  published: Boolean
  translations: [
    {
      _id?: ObjectId
      lang: string
      title?: string
      description?: string
    }
  ]
}

const Announcement = new Schema<Announcement>({
  guildId: { type: String, required: true },
  name: { type: String, required: true },
  title: { type: String, required: false },
  // TODO: Haced comprobación de maxLength en los comandos
  description: { type: String, required: false, maxlength: 4096 },
  // @ts-expect-error
  color: { type: HexColorString, required: false },
  published: { type: Boolean, required: true, default: false },
  translations: [
    {
      lang: { type: String, required: true },
      title: { type: String, required: false },
      description: { type: String, required: false, maxlength: 4096}
    }
  ]
})

const Model = models.Announcement || model<Announcement>('Announcement', Announcement)
export default Model

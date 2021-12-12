import { model, ObjectId, Schema, models } from 'mongoose'
import HexColorString from './HexColorStringType'
import { HexColorString as HexColorStringType } from 'discord.js'

interface Announcement {
  name: string
  title?: string
  description?: string
  color: HexColorStringType
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
  name: { type: String, required: true },
  title: { type: String, required: false },
  description: { type: String, required: false, maxlength: 4096, minlength: 10 },
  // TODO: Crear tipo de color de mongos
  // @ts-expect-error
  color: { type: HexColorString, required: true },
  translations: [
    {
      lang: { type: String, required: true },
      title: { type: String, required: false },
      description: { type: String, required: false, maxlength: 4096, minlength: 10 }
    }
  ]
})

const Model = models.Announcement || model<Announcement>('Announcement', Announcement)
export default Model

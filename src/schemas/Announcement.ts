import { model, ObjectId, Schema } from 'mongoose'

export interface AnnouncementType {
  _id?: ObjectId
  guildId: string
  name: string
  title?: string
  description?: string
  color?: String
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

const AnnouncementSchema = new Schema<AnnouncementType>({
  guildId: { type: String, required: true },
  name: { type: String, required: true },
  title: { type: String, required: false },
  description: { type: String, required: false, maxlength: 4096 },
  color: { type: String, required: false },
  published: { type: Boolean, required: true, default: false },
  translations: [
    {
      lang: { type: String, required: true },
      title: { type: String, required: false },
      description: { type: String, required: false, maxlength: 4096 }
    }
  ]
})

const Model = model<AnnouncementType>('Announcement', AnnouncementSchema)
export const Announcement = Model

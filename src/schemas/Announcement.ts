import * as mongoose from 'mongoose'

export interface AnnouncementType {
  _id: mongoose.ObjectId
  guildId: string
  name: string
  title?: string
  description?: string
  color?: String
  image?: String
  thumbnail?: String
  footer?: String
  url?: String
  published: Boolean
  translations: [
    {
      _id?: mongoose.ObjectId
      lang: string
      title?: string
      description?: string
    }
  ]
}

const AnnouncementSchema = new mongoose.Schema<AnnouncementType>({
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

export const Announcement: mongoose.Model<AnnouncementType> = mongoose.models.Announcement || mongoose.model<AnnouncementType>('Announcement', AnnouncementSchema)

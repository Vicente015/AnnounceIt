import * as mongoose from 'mongoose'
import { URLRegex } from '../utils/Regex'

export interface AnnouncementType {
  _id: mongoose.ObjectId
  guildId: string
  name: string
  title?: string
  description?: string
  color?: string
  // ? Waiting for Discord Support
  // image?: String
  // thumbnail?: String
  footer?: string
  url?: string
  published: boolean
  translations: [
    {
      _id?: mongoose.ObjectId
      lang: string
      title?: string
      description?: string
      footer?: string
      url?: string
    }
  ]
}

const AnnouncementSchema = new mongoose.Schema<AnnouncementType>({
  guildId: { type: String, required: true },
  name: { type: String, required: true },
  title: { type: String, required: false },
  description: { type: String, required: false, maxlength: 4096 },
  color: { type: String, required: false, default: 'BLURPLE' },
  footer: { type: String, required: false, maxLength: 2048 },
  url: { type: String, required: false, match: URLRegex },
  published: { type: Boolean, required: true, default: false },
  translations: [
    {
      lang: { type: String, required: true },
      title: { type: String, required: false },
      description: { type: String, required: false, maxlength: 4096 },
      footer: { type: String, required: false, maxLength: 2048 },
      url: { type: String, required: false, match: URLRegex }
    }
  ]
})

export const Announcement: mongoose.Model<AnnouncementType> = mongoose.models.Announcement || mongoose.model<AnnouncementType>('Announcement', AnnouncementSchema)

import { EmbedLimits, TextInputLimits } from '@sapphire/discord-utilities'
import * as mongoose from 'mongoose'
import { URLRegex } from '../utils/Regex'

export interface AnnouncementType {
  _id: mongoose.ObjectId
  guildId: string
  name: string
  title?: string
  description: string
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
      description: string
      footer?: string
      url?: string
    }
  ]
}

const AnnouncementSchema = new mongoose.Schema<AnnouncementType>({
  guildId: { type: String, required: true },
  name: { type: String, required: true },
  title: { type: String, required: false, maxlength: EmbedLimits.MaximumTitleLength },
  description: { type: String, required: false, maxlength: TextInputLimits.MaximumValueCharacters },
  color: { type: String, required: false },
  footer: { type: String, required: false, maxLength: EmbedLimits.MaximumFooterLength },
  url: { type: String, required: false, match: URLRegex },
  published: { type: Boolean, required: true, default: false },
  translations: [
    {
      lang: { type: String, required: true },
      title: { type: String, required: false, maxlength: EmbedLimits.MaximumTitleLength },
      description: { type: String, required: true, maxlength: TextInputLimits.MaximumValueCharacters },
      footer: { type: String, required: false, maxLength: EmbedLimits.MaximumFooterLength },
      url: { type: String, required: false, match: URLRegex }
    }
  ]
})

export const Announcement: mongoose.Model<AnnouncementType> = mongoose.models.Announcement || mongoose.model<AnnouncementType>('Announcement', AnnouncementSchema)

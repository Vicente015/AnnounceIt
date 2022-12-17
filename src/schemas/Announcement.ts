import { EmbedLimits, TextInputLimits } from '@sapphire/discord-utilities'
import * as mongoose from 'mongoose'
import { URLRegex } from '../utils/Regex'
import { MaxNameLength } from './OwSchemas'

// todo: Integrate ow schema into this??
export interface AnnouncementType {
  _id: mongoose.ObjectId
  guildId: string
  name: string
  title?: string
  description: string
  published: boolean
  color?: string
  footer?: string
  url?: string
  image?: string
  thumbnail?: string
  translations: [
    {
      _id?: mongoose.ObjectId
      lang: string
      title?: string
      description: string
      footer?: string
      url?: string
      image?: string
      thumbnail?: string
    }
  ]
}

const AnnouncementSchema = new mongoose.Schema<AnnouncementType>({
  guildId: { type: String, required: true },
  name: { type: String, required: true, maxLength: MaxNameLength },
  title: { type: String, required: false, maxlength: EmbedLimits.MaximumTitleLength },
  description: { type: String, required: false, maxlength: TextInputLimits.MaximumValueCharacters },
  published: { type: Boolean, required: true, default: false },
  color: { type: String, required: false },
  footer: { type: String, required: false, maxLength: EmbedLimits.MaximumFooterLength },
  url: { type: String, required: false, match: URLRegex },
  image: { type: String, required: false },
  thumbnail: { type: String, required: false },
  translations: [
    {
      lang: { type: String, required: true },
      title: { type: String, required: false, maxlength: EmbedLimits.MaximumTitleLength },
      description: { type: String, required: true, maxlength: TextInputLimits.MaximumValueCharacters },
      footer: { type: String, required: false, maxLength: EmbedLimits.MaximumFooterLength },
      url: { type: String, required: false, match: URLRegex },
      image: { type: String, required: false },
      thumbnail: { type: String, required: false }
    }
  ]
})

export const Announcement: mongoose.Model<AnnouncementType> = mongoose.models.Announcement || mongoose.model<AnnouncementType>('Announcement', AnnouncementSchema)

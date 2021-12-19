import { model, ObjectId, Schema, models, Model } from 'mongoose'
import { ColorResolvable } from 'discord.js'

interface AnnouncementType {
  name: string
  title?: string
  description?: string
  color: ColorResolvable
  translations: Array<{
    _id?: ObjectId
    lang: string
    title?: string
    description?: string
  }>
}

const Announcement = new Schema<AnnouncementType>({
  name: { type: String, required: true },
  title: { type: String, required: false },
  description: { type: String, required: false, maxlength: 4096, minlength: 10 },
  color: { type: String, required: true },
  translations: [
    {
      lang: { type: String, required: true },
      title: { type: String, required: false },
      description: { type: String, required: false, maxlength: 4096, minlength: 10 }
    }
  ]
})

const uwu: Model<AnnouncementType> = models.Announcement ?? model<AnnouncementType>('Announcement', Announcement)
export default uwu

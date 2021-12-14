import { model, ObjectId, Schema, models, Model } from 'mongoose'
import { ColorResolvable } from 'discord.js'

interface Announcement {
  name: string
  title?: string
  description?: string
  color: ColorResolvable
  translations: [Translation]
}

interface Translation {
  lang: string
  title?: string
  description?: string
}

const Announcement = new Schema<Announcement>({
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

const uwu: Model<Announcement> = models.Announcement ?? model<Announcement>('Announcement', Announcement)
export default uwu

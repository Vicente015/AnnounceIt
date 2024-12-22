import mongoose from 'mongoose'

export interface ScheduledPostType {
  _id: mongoose.ObjectId
  announcementId: mongoose.ObjectId
  channelId: string
  at: mongoose.Date
}

const ScheduledPostSchema = new mongoose.Schema<ScheduledPostType>({
  announcementId: { type: String, required: true },
  channelId: { type: String, required: true },
  at: { type: Date, required: true }
})

export const ScheduledPost: mongoose.Model<ScheduledPostType> = mongoose.models.ScheduledPost || mongoose.model<ScheduledPostType>('ScheduledPost', ScheduledPostSchema)

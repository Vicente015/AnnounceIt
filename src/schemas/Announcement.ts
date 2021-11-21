import { model, Schema } from "mongoose"

const Announcement = new Schema({
  title: { type: String, required: false },
  description: { type: String, required: false, maxlength: 4096, minlength: 10 },
  // TODO: Crear tipo de color de mongos
  color: { type: String, required: true },
  translations: [
    {
      lang: {  type: String, required: true },
      title: { type: String, required: false },
      description: { type: String, required: false, maxlength: 4096, minlength: 10 }
    },
  ],
})

export default model('Announcement', Announcement)
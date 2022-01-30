import * as mongoose from 'mongoose'

export interface ConfigType {
  guildId: string
  managerRoles: string[]
}

const ConfigSchema = new mongoose.Schema<ConfigType>({
  guildId: { type: String, required: true },
  managerRoles: { type: [String], required: true }
})

export const Config: mongoose.Model<ConfigType> = mongoose.models.Config || mongoose.model<ConfigType>('Config', ConfigSchema)

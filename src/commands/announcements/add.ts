import { fetchT, TFunction } from '@sapphire/plugin-i18next'
import { Subcommand } from '@sapphire/plugin-subcommands'
import { Modal } from 'discord.js'
import ow from 'ow'
import { MessageComponentTypes } from 'discord.js/typings/enums'
import { nameSchema } from '../../schemas/OwSchemas'
import getModalComponents from '../../utils/getModalComponents'
import { Image, temporaryImgStorage } from '../../utils/Globals'
import { validateChatInput } from '../../utils/validateOptions'

export const imageFormats = ['.png', '.jpg', '.jpeg', '.gif', '.webp']
const schema = ow.object.exactShape({
  // eslint-disable-next-line sort/object-properties
  name: nameSchema,
  image: ow.optional.string.url.validate((string) => ({
    message: () => 'commands:add.notValidImage',
    validator: imageFormats.some((extension) => string.endsWith(extension))
  })).message(() => 'commands:add.notValidImage'),
  thumbnail: ow.optional.string.url.validate((string) => ({
    message: () => 'commands:add.notValidImage',
    validator: imageFormats.some((extension) => string.endsWith(extension))
  })).message(() => 'commands:add.notValidImage')
})

export async function add (interaction: Subcommand.ChatInputInteraction) {
  const t: TFunction = await fetchT(interaction)
  const options = await validateChatInput(interaction, schema)
  if (!options) return
  const { image, name: id, thumbnail } = options

  if (image ?? thumbnail) {
    const images: Image[] = []
    if (image) {
      images.push({ type: 'IMAGE', url: image })
    }
    if (thumbnail) {
      images.push({ type: 'THUMBNAIL', url: thumbnail })
    }
    temporaryImgStorage.set(interaction.id, images)
  }

  const modal = new Modal()
    .setTitle(t('commands:add.modalTitle'))
    .setCustomId(`addAnnouncement:${interaction.id}:${Date.now()}:${id}`)

  const components = await getModalComponents(interaction)

  // @ts-expect-error
  modal.setComponents([
    // ? Makes an actionRow for every textInput
    components
      .map((component) => ({
        components: [component],
        type: MessageComponentTypes.ACTION_ROW
      }))
  ])

  try {
    await interaction.showModal(modal)
  } catch (error) {
    interaction.client.logger.error(error)
  }
}

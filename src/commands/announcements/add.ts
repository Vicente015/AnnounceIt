import { EmbedLimits, TextInputLimits } from '@sapphire/discord-utilities'
import { fetchT, TFunction } from '@sapphire/plugin-i18next'
import { Subcommand } from '@sapphire/plugin-subcommands'
import { Modal } from 'discord.js'
import ow from 'ow'
import { MessageComponentTypes, TextInputStyles } from 'discord.js/typings/enums'
import { validateChatInput } from '../../utils/validateOptions'

const schema = ow.object.exactShape({
  name: ow.string
})

export async function add (interaction: Subcommand.ChatInputInteraction) {
  const t: TFunction = await fetchT(interaction)
  const options = await validateChatInput(interaction, schema)
  if (!options) return
  const { name: id } = options

  const modal = new Modal()
    .setTitle(t('commands:add.modalTitle'))
    .setCustomId(`addAnnouncement:${interaction.id}:${Date.now()}:${id}`)

  const components = [
    /*
      {
        customId: 'name',
        label: 'Name',
        maxLength: 16,
        minLength: 3,
        placeholder: 'Escriba el nombre del anuncio, este valor es puramente identificativo',
        required: true,
        style: TextInputStyles.SHORT,
        type: MessageComponentTypes.TEXT_INPUT
      },
    */
    {
      customId: 'title',
      maxLength: EmbedLimits.MaximumTitleLength,
      required: false,
      style: TextInputStyles.PARAGRAPH,
      type: MessageComponentTypes.TEXT_INPUT
    },
    {
      customId: 'description',
      maxLength: TextInputLimits.MaximumValueCharacters,
      required: true,
      style: TextInputStyles.PARAGRAPH,
      type: MessageComponentTypes.TEXT_INPUT
    },
    {
      customId: 'footer',
      maxLength: EmbedLimits.MaximumFooterLength,
      required: false,
      style: TextInputStyles.PARAGRAPH,
      type: MessageComponentTypes.TEXT_INPUT
    },
    {
      customId: 'url',
      required: false,
      style: TextInputStyles.SHORT,
      type: MessageComponentTypes.TEXT_INPUT
    },
    {
      customId: 'color',
      required: false,
      style: TextInputStyles.SHORT,
      type: MessageComponentTypes.TEXT_INPUT
    }
  ]
    .map((component) => ({
      ...component,
      label: t(`commands:add.modal.${component.customId}.label`),
      placeholder: t(`commands:add.modal.${component.customId}.placeholder`)
    }))

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
    console.debug(error)
  }
}

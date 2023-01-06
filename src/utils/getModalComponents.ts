import { EmbedLimits, TextInputLimits } from '@sapphire/discord-utilities'
import { fetchT, TFunction } from '@sapphire/plugin-i18next'
import { CommandInteraction } from 'discord.js'
import { MessageComponentTypes, TextInputStyles } from 'discord.js/typings/enums'

const components = [
  /*
    {
      customId: 'name',
      maxLength: 16,
      minLength: 3,
      required: true,
      style: TextInputStyles.SHORT,
      type: MessageComponentTypes.TEXT_INPUT
    }
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

// type CustomIdTypes = 'title' | 'description' | 'footer' | 'url' | 'color'
// type ComponentsType = Array<TextInputComponentOptions & { customId: CustomIdTypes }>

/**
 * Gets the modal components
 * @param interaction The chat input interaction to fetch T
 * @returns Array of modal components
 */
export default async function getModalComponents (interaction: CommandInteraction) {
  const t: TFunction = await fetchT(interaction)

  return components.map((component) => ({
    ...component,
    label: t(`commands:add.modal.${component.customId}.label`),
    placeholder: t(`commands:add.modal.${component.customId}.placeholder`)
  }))
}

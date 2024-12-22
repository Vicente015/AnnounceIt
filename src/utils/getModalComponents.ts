import { EmbedLimits, TextInputLimits } from '@sapphire/discord-utilities'
import { fetchT, TFunction } from '@sapphire/plugin-i18next'
import { CommandInteraction, ComponentType, TextInputComponentData, TextInputStyle } from 'discord.js'

const components: Array<Omit<TextInputComponentData, 'label'>> = [
  /*
    {
      customId: 'name',
      maxLength: 16,
      minLength: 3,
      required: true,
      style: TextInputStyle.SHORT,
      type: ComponentType.TEXT_INPUT
    }
  */
  {
    customId: 'title',
    maxLength: EmbedLimits.MaximumTitleLength,
    required: false,
    style: TextInputStyle.Paragraph,
    type: ComponentType.TextInput
  },
  {
    customId: 'description',
    maxLength: TextInputLimits.MaximumValueCharacters,
    required: true,
    style: TextInputStyle.Paragraph,
    type: ComponentType.TextInput
  },
  {
    customId: 'footer',
    maxLength: EmbedLimits.MaximumFooterLength,
    required: false,
    style: TextInputStyle.Paragraph,
    type: ComponentType.TextInput
  },
  {
    customId: 'url',
    required: false,
    style: TextInputStyle.Short,
    type: ComponentType.TextInput
  },
  {
    customId: 'color',
    required: false,
    style: TextInputStyle.Short,
    type: ComponentType.TextInput
  }
]

// type CustomIdTypes = 'title' | 'description' | 'footer' | 'url' | 'color'
// type ComponentsType = Array<TextInputBuilderOptions & { customId: CustomIdTypes }>

/**
 * Gets the modal components
 * @param interaction The chat input interaction to fetch T
 * @returns Array of modal components
 */
export default async function getModalComponents (interaction: CommandInteraction, removeColor?: boolean): Promise<TextInputComponentData[]> {
  const t: TFunction = await fetchT(interaction)
  if (removeColor === true) components.pop()

  return components.map((component) => ({
    ...component,
    label: t(`commands:add.modal.${component.customId}.label`),
    placeholder: t(`commands:add.modal.${component.customId}.placeholder`)
  }))
}

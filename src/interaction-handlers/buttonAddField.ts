import { EmbedLimits } from '@sapphire/discord-utilities'
import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework'
import { fetchT } from '@sapphire/plugin-i18next'
import { ButtonInteraction, Modal } from 'discord.js'
import { MessageComponentTypes, TextInputStyles } from 'discord.js/typings/enums'

export class ButtonHandler extends InteractionHandler {
  public constructor (context: PieceContext, options: InteractionHandler.Options) {
    super(context, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button
    })
  }

  public override async run (interaction: ButtonInteraction, result: InteractionHandler.ParseResult<this>) {
    return await interaction.reply(result)
  }

  public override async parse (interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith('addField:')) return
    const announcementId = interaction.customId.split(':')[1]
    const t = await fetchT(interaction)

    const modal = new Modal()
      .setTitle('Añadir field')
      .setCustomId(`addField:${interaction.id}:${announcementId}`)

    const components = [
      {
        customId: 'name',
        maxLength: EmbedLimits.MaximumFieldNameLength,
        required: true,
        style: TextInputStyles.PARAGRAPH,
        type: MessageComponentTypes.TEXT_INPUT
      },
      {
        customId: 'value',
        maxLength: EmbedLimits.MaximumFieldValueLength,
        required: true,
        style: TextInputStyles.PARAGRAPH,
        type: MessageComponentTypes.TEXT_INPUT
      }
    ]
      .map((component) => ({
        ...component,
        label: t(`commands:add.modalField.${component.customId}.label`),
        placeholder: t(`commands:add.modalField.${component.customId}.placeholder`)
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
      console.error(error)
    }
  }
}

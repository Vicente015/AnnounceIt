import { EmbedLimits } from '@sapphire/discord-utilities'
import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework'
import type { ModalSubmitInteraction } from 'discord.js'
import ow from 'ow'

const Schema = ow.object.exactShape({
  // eslint-disable-next-line sort/object-properties
  name: ow.string.nonEmpty.maxLength(EmbedLimits.MaximumFieldNameLength).message(() => 'commands:add.fieldNameMaxLength'),
  description: ow.string.nonEmpty.maxLength(EmbedLimits.MaximumFieldValueLength).message(() => 'commands:add.fieldValueMaxLength')
  // inline: ow.optional.string.nonEmpty.oneOf(['true', 'false']).message(() => 'commands:add.fieldNoInline'),
})

export class ModalHandler extends InteractionHandler {
  public constructor (context: PieceContext, options: InteractionHandler.Options) {
    super(context, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.ModalSubmit
    })
  }

  public override parse (interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith('addField:')) return this.none()
    return this.some()
  }

  public async run (interaction: ModalSubmitInteraction) {}
}

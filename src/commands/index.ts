import { SlashCommandBuilder } from "@discordjs/builders"

const AnnouncementsCommands = new SlashCommandBuilder()
  .setName('announcements')
  .setDescription('Maneja los anuncios')
  .addSubcommand((subcommand) => {
    return subcommand
      .setName('add')
      .setDescription('Añade un anuncio')
      .addStringOption((option) => {
        return option
          .setName('title')
          .setDescription('El título del anuncio')
          .setRequired(false)
      })
      .addStringOption((option) => {
        return option
          .setName('color')
          .setDescription('El color del anuncio')
      })
  })
  .addSubcommand((subcommand) => {
    return subcommand
      .setName('add_translation')
      .setDescription('Añade una traducción al anuncio')
      .addStringOption((option) => {
        return option
          .setName('lang')
          .setDescription('El idioma del anuncio')
          .setRequired(true)
      })
      .addStringOption((option) => {
        return option
          .setName('title')
          .setDescription('El título del anuncio')
          .setRequired(false)
      })
  })
  .addSubcommand((subcommand) => {
    return subcommand
      .setName('publish')
      .setDescription('Publica un anuncio')
      .addChannelOption((option) => {
        return option
          .setName('channel')
          .setDescription('El canal del anuncio')
          .setRequired(true)
      })
  })

export default AnnouncementsCommands.toJSON()
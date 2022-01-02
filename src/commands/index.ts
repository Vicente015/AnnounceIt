import { SlashCommandBuilder } from '@discordjs/builders'
import { ChannelTypes } from 'discord.js/typings/enums'

const AnnouncementsCommands = new SlashCommandBuilder()
  .setName('announcements')
  .setDescription('Maneja los anuncios')
  .addSubcommand((subcommand) => {
    return subcommand
      .setName('add')
      .setDescription('Añade un anuncio')
      .addStringOption((option) => {
        return option
          .setName('name')
          .setDescription('El identificador o nombre del anuncio')
          .setRequired(true)
      })
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
          .setName('name')
          .setDescription('El identificador o nombre del anuncio')
          .setRequired(true)
          .setAutocomplete(true)
      })
      .addStringOption((option) => {
        return option
          .setName('lang')
          .setDescription('El idioma del anuncio')
          .setRequired(true)
          .setAutocomplete(true)
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
      .addStringOption((option) => {
        return option
          .setName('name')
          .setDescription('Nombre del anuncio que desea publicar')
          .setRequired(true)
          .setAutocomplete(true)
      })
      .addChannelOption((option) => {
        return option
          .setName('channel')
          .setDescription('El canal del anuncio')
          .setRequired(true)
          .addChannelType(0)
      })
  })

export default AnnouncementsCommands.toJSON()

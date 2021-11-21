import { ApplicationCommand, Client, Collection } from "discord.js";
import { Mongoose } from "mongoose";

export default class extends Client {
  commands: Collection<string, ApplicationCommand> = new Collection()
  mongoose: Mongoose
}
const Discord = require('discord.js');
const prefix = require("@replit/database");
const prefixx = new prefix();

module.exports = {
  name: "Sbforaging",
  description: "Earn Foraging XP",
  usage: "sbforaging",
  perms: "None",
  folder: "SkyblockSim",
  aliases: ['foraging'],
  cooldown: 60,
  async execute(client, message, args, mclient) {

    const collection = mclient.db('SkyblockSim').collection('Main');
    let found = await collection.findOne({ _id: message.author.id })

    var gprefix = await prefixx.get(message.guild.id, { raw: false });
    if (gprefix === null) gprefix = '.';

    if (found === null) {
      const noprofile = new Discord.MessageEmbed()
        .setColor('RED')
        .setTitle('No Profile found')
        .setDescription(`Create a Profile using \`${gprefix}sbstart\` or \`${gprefix}sbcreate\``)
      message.channel.send({ embeds: [noprofile] })
      return;
    }

    let earnedxp = Math.floor(Math.random() * (100 - 1) + 1)

    await collection.updateOne(
      { _id: message.author.id },
      { $inc: { foraging: earnedxp } },
      { upsert: true })

    const finished = new Discord.MessageEmbed()
      .setColor('90EE90')
      .setDescription(`Finished cutting Trees and earned <:foraging:852069714447695872> ${earnedxp} Foraging XP.`)

    message.channel.send({ embeds: [finished] })

  }
};
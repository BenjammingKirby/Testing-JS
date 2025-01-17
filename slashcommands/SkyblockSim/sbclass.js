const Discord = require('discord.js');
const cataLevel = require('../../constants/Simulator/Functions/dungeonlevel.js')

module.exports = {
  name: "sbclass",
  description: "a",
  usage: "sbsettings (Setting Name)",
  perms: "None",
  folder: "SkyblockSim",
  aliases: [],
  cooldown: 10,
  async execute(interaction, mclient) {

    const collection = mclient.db('SkyblockSim').collection('Players');
    let player = await collection.findOne({ _id: interaction.user.id })

    let classchoosen = interaction.options.getString('choice')

    let assassinxp = player.data.dungeons.class.available.assassin.xp
    let berserkerxp = player.data.dungeons.class.available.berserker.xp
    let tankxp = player.data.dungeons.class.available.tank.xp
    let currentclass = player.data.dungeons.class.selected.name
    let currentxp = player.data.dungeons.class.selected.xp

    let assassinlevel = await cataLevel(assassinxp).level
    let berserkerlevel = await cataLevel(berserkerxp).level
    let tanklevel = cataLevel(tankxp).level


    if (player === null) {
      const noprofile = new Discord.MessageEmbed()
        .setColor('RED')
        .setTitle('No Profile found')
        .setDescription(`Create a Profile using \`/sb start\``)
      interaction.editReply({ embeds: [noprofile] })
      return;
    }

    if (classchoosen === null) {
      const classes = new Discord.MessageEmbed()
        .setColor('GREY')
        .setFooter('Skyblock Simulator')
        .setDescription(`**Available Classes and their Stats**\n\n**Assassin [${assassinlevel}]**\n2 Strength per Level\n\n**Berserker [${berserkerlevel}]**\n1 Strength and 1 Defense per Level\n\n**Tank [${tanklevel}]**\n1 Defense and 2 Health Per Level\n\n\n**Currently Selected**\nName: ${currentclass}\nXP: ${currentxp}`)
      interaction.editReply({ embeds: [classes] })
      return;
    }

    if (classchoosen === 'Assassin') {
      await collection.updateOne(
        { _id: interaction.user.id },
        { $set: { 'data.dungeons.class.selected.name': 'Assassin', 'data.dungeons.class.selected.xp': assassinxp } },
        { upsert: true })
    } else if (classchoosen === 'Berserker') {
      await collection.updateOne(
        { _id: interaction.user.id },
        { $set: { 'data.dungeons.class.selected.name': 'Berserker', 'data.dungeons.class.selected.xp': berserkerxp } },
        { upsert: true })
    } else if (classchoosen === 'Tank') {
      await collection.updateOne(
        { _id: interaction.user.id },
        { $set: { 'data.dungeons.class.selected.name': 'Tank', 'data.dungeons.class.selected.xp': tankxp } },
        { upsert: true })
    }

    const selection = new Discord.MessageEmbed()
      .setDescription(`Successfully switched Class to **${classchoosen}**.`)
      .setColor('GREEN')
      .setFooter('Skyblock Simulator')

    interaction.editReply({ embeds: [selection] })
  }
};
const Discord = require('discord.js');
const lt = require('../../constants/Simulator/LootTables/loottables.js')

module.exports = {
  name: "sbfarm",
  description: "Earnes you Money",
  usage: "sbfarm",
  perms: "None",
  folder: "SkyblockSim",
  aliases: ['sbgrind', 'sbf', 'sbg'],
  cooldown: 5,
  async execute(interaction, mclient) {


    //Getting Info from Database
    const collection = mclient.db('SkyblockSim').collection('Players');
    let player = await collection.findOne({ _id: interaction.user.id })


    if (player === null) {
      const noprofile = new Discord.MessageEmbed()
        .setColor('RED')
        .setTitle('No Profile found')
        .setDescription(`Create a Profile using \`/sb start\``)
      interaction.editReply({ embeds: [noprofile] })
      return;
    }

    //Shorts for some Values
    let location = player.data.misc.location
    let mf = player.data.skills.magic_find
    let areas = ['Graveyard', 'Ruins', 'Highlevel', 'Lower Spiders Hill', 'Upper Spiders Hill', 'Spider Cave', 'Molten Castle', 'Molten Bridge', 'Lava Field', 'End Gate', 'Dragon\'s Nest', 'Void Supelture']

    //Check if Player is at valid Combat Area
    if (!areas.includes(location)) {
      const badarea = new Discord.MessageEmbed()
        .setTitle('Invalid Combat Area')
        .setDescription(`You are currently at the **${location}** which isn\'t a Combat area.`)
        .setColor('RED')
        .setFooter('Skyblock Simulator')

      interaction.editReply({ embeds: [badarea] })
      return
    }


    const start = new Discord.MessageEmbed()
      .setColor('90EE90')
      .setDescription(`<a:runningsteve:865198832316317706> Wandering around the **${location}** to find Mobs.`)
      .setFooter('Skyblock Simulator')

    const menu = await interaction.editReply({ embeds: [start] })

    //Settings a small wait time for "find Mobs"
    sleep(2000)

    //Failing to Find Mobs
    let findmobs = Math.floor(Math.random() * (15 - 1) + 1)
    let rolledmobs = Math.floor(Math.random() * (15 - 1) + 1)

    if (findmobs === rolledmobs) {
      const nomobsfound = new Discord.MessageEmbed()
        .setColor('RED')
        .setDescription(`Failed to find any Mobs in the **${location}**`)
        .setFooter('Skyblock Simulator')
      menu.edit({ embeds: [nomobsfound] })
      return;
    }

    //Amount of Mobs being killed
    let mobkills = Math.floor(Math.random() * (4 - 1) + 1)

    //Normal Drops
    let amount = Math.floor(Math.random() * (3 - 1) + 1)
    let mobdrop = ''

    //Some Variables needed
    let mob = ''
    let img = ''

    //Deciding Mob Name, Drops, Image
    if (location === 'Graveyard') {
      mob = ['Zombie', 'Zombie Villager', 'Crypt Ghoul']
      mobdrop = lt.zombie.roll(mf)
      img = 'https://cdn.discordapp.com/attachments/841757730887827497/865209122902900756/unknown.png'
    } else if (location === 'Ruins') {
      mob = ['Wolf', 'Angry Wolf', 'Old Wolf']
      mobdrop = lt.wolf.roll(mf)
      img = 'https://cdn.discordapp.com/attachments/841757730887827497/865212002020229170/unknown.png'
    } else if (location === 'Highlevel') {
      mobdrop = lt.skeleton.roll(mf)
      mob = ['Skeleton', 'Skeleton Soldier', 'Fuming Skeleton']
      img = 'https://cdn.discordapp.com/attachments/841757730887827497/865213190210977812/unknown.png'
    } else if (location === 'Lower Spiders Hill') {
      mob = ['Splitter Spider', 'Weaver Spider', 'Voracious Spider']
      mobdrop = lt.spider.roll(mf)
      img = 'https://cdn.discordapp.com/attachments/841757730887827497/865213484403916800/unknown.png'
    } else if (location === 'Upper Spiders Hill') {
      mob = ['Silverfish', 'Spider Jockey', 'Dasher Spider']
      mobdrop = lt.spider.roll(mf)
      img = 'https://cdn.discordapp.com/attachments/841757730887827497/865213484403916800/unknown.png'
    } else if (location === 'Spider Cave') {
      mob = ['Arachne Keeper', 'Slime', 'Arachne Guards']
      mobdrop = lt.slime.roll(mf)
      img = 'https://cdn.discordapp.com/attachments/841757730887827497/865218000138272808/unknown.png'
    } else if (location === 'Molten Castle') {
      mob = ['Blaze', 'Zombie Pigman', 'Zombified Piglin']
      mobdrop = lt.blazing1.roll(mf)
      img = 'https://cdn.discordapp.com/attachments/841757730887827497/865214803769294898/unknown.png'
    } else if (location === 'Molten Bridge') {
      mob = ['Wither Skeleton', 'Baby Magma Cube', 'Molten Magma Cube']
      mobdrop = lt.blazing2.roll(mf)
      img = 'https://cdn.discordapp.com/attachments/841757730887827497/865214529684504586/unknown.png'
    } else if (location === 'Lava Field') {
      mob = ['Ghast', 'Crying Ghast', 'Molten Ghast']
      mobdrop = lt.blazing3.roll(mf)
      img = 'https://cdn.discordapp.com/attachments/841757730887827497/865214391028678656/unknown.png'
    } else if (location === 'End Gate') {
      mob = ['Enderman', 'Endermite', 'Enderling']
      mobdrop = lt.enderman.roll(mf)
      img = 'https://cdn.discordapp.com/attachments/841757730887827497/865215268330405898/unknown.png'
    } else if (location === 'Dragon\'s Nest') {
      mob = ['Zealot', 'Obsidian Defender', 'Watcher']
      mobdrop = lt.endnest.roll(mf)
      img = 'https://cdn.discordapp.com/attachments/841757730887827497/865215569128194078/unknown.png'
    } else if (location === 'Void Supelture') {
      mob = ['Voidling Fanatic', 'Voidling Extremist', 'Voidling Devotee']
      mobdrop = lt.endvoid.roll(mf)
      img = 'https://cdn.discordapp.com/attachments/841757730887827497/865215776332185630/unknown.png'
    }


    //Add Normal Drops
    if (mobdrop != undefined) {
      const updatePlayer = addItems(mobdrop, amount, player)

      await collection.replaceOne(
        { _id: interaction.user.id },
        updatePlayer
      )
    }



    //Deciding Mob Name that gets killed
    let mobname = mob[Math.floor(Math.random() * mob.length)];
    let combatxp = Math.floor(Math.random() * (100 - 50) + 50)

    await collection.updateOne(
          { _id: interaction.user.id },
          { $inc: { 'data.skills.combat': combatxp } },
          { upsert: true })

    const endembed = new Discord.MessageEmbed()
    if (player.data.settings.imgshown === true) {
      endembed.setImage(`${img}`)
    }
    endembed.setColor('90EE90')

    let imgShown = player.data.settings.imgshown ? 'disable' : 'enable'
    endembed.setFooter(`Skyblock Simulator\nIf you wish to ${imgShown} a picture of the area being shown, use /sb settings img`)

    if (mobkills === 1) {
      endembed.setDescription(`<:berserker:852079613052059658> Killing **${mobkills} ${mobname}** at the **${location}** dropped you **${amount}x ${mobdrop}**`)
    } else {
      endembed.setDescription(`<:berserker:852079613052059658> Killing **${mobkills} ${mobname}s** at the **${location}** dropped you **${amount}x ${mobdrop}**`)
    }
    menu.edit({ embeds: [endembed] })
  }
};

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function addItems(mobdrop, amount, player) {
  if (!player.data.inventory.items) player.data.inventory.items = []

  if (player.data.inventory.items.length === 0) {
    player.data.inventory.items.push({
      name: mobdrop,
      amount: amount
    })
    return player
  }

  for (const item of player.data.inventory.items) {
    if (item.name === mobdrop) {
      item.amount += amount
      return player
    }
  }

  player.data.inventory.items.push({
    name: mobdrop,
    amount: amount
  })
  return player
}
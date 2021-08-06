const Discord = require('discord.js');
const prefix = require("@replit/database");
const prefixx = new prefix();
const list = require('../../Various/Skyblock/prices.json');
const fetch = require('node-fetch')

module.exports = {
  name: "sbsell",
  description: "Sells Items for Skyblock Simulator",
  usage: "sbsell (Itemname) (Amount)",
  perms: "None",
  folder: "SkyblockSim",
  aliases: ['sell'],
  cooldown: 10,
  async execute(interaction, mclient) {

    const collection = mclient.db('SkyblockSim').collection('Players');
    let player = await collection.findOne({ _id: interaction.user.id })


    var gprefix = await prefixx.get(interaction.guild.id, { raw: false });
    if (gprefix === null) gprefix = '.';


    if (player === null) {
      const nodata = new Discord.MessageEmbed()
        .setColor('RED')
        .setDescription(`No Profile found for <@!${id}>`)
      interaction.editReply({ embeds: [nodata] })
      return;
    }

    //Creating the String for the Inventory
    let str = ''
    if (player.data.inventory.items === undefined) {
      str = 'Empty'
    } else {
      for (item of player.data.inventory.items) {
        str += item.name + ': ' + item.amount + '\n'
      }
    }


    //Variables for Checks
    let amount = interaction.options.getInteger('amount');
    let price = ''


    let bzname = interaction.options.getString('item').split(" ")
    bzname = bzname.join('_').toUpperCase()


    let input = interaction.options.getString('item')
    const words = input.split(" ");

    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }

    let sellitem = words.join(" ");


    const founditem = player.data.inventory.items.find(item => item.name === sellitem)

    if (founditem === undefined) {
      interaction.editReply('Invalid Item entered')
      return;
    }

    //Check if more than 1 of said item exists
    if (founditem === undefined || founditem.amount === 0) {
      const noitems = new Discord.MessageEmbed()
        .setFooter('Skyblock Simulator')
        .setColor('RED')
        .setDescription(`You don\'t have enough Items to be sold.`)
      interaction.editReply({ embeds: [noitems] })
      return;
    }

    //Check if a Number higher than the owned Amount is enterd
    if (founditem.amount < amount) {
      const littleitems = new Discord.MessageEmbed()
        .setFooter('Skyblock Simulator')
        .setColor('RED')
        .setDescription(`You entered a Number higher than the Amount of ${sellitem} than you own.\nEntered: **${amount}**\nOwned: **${founditem.amount}**`)
      interaction.editReply({ embeds: [littleitems] })
      return;
    }

    //Get Price for the Item and Calculate earned coins
    let data = await getPrice1(bzname)

    if (data.error) {
      price = await getPrice(sellitem)
    } else {
      price = Math.floor(data.quick_status.sellPrice)
      sellitem = data.name
    }
    let earnedcoins = price * amount

    //Add Coins and remove Items
    if (earnedcoins) {

      const updatePlayer = addItem(sellitem, amount, player)

      await collection.replaceOne(
        { _id: interaction.user.id },
        updatePlayer
      )

      await collection.updateOne(
        { _id: interaction.user.id },
        { $inc: { 'data.profile.coins': earnedcoins } },
        { upsert: true }
      )

      const sold = new Discord.MessageEmbed()
        .setFooter('Skyblock Simulator')
        .setColor('90EE90')
        .setDescription(`Successfully sold **${amount}x ${sellitem}** for **${earnedcoins} Coins**`)
      interaction.editReply({ embeds: [sold] })
      return;
    }
  }
};

function addItem(sellitem, amount, player) {
  if (!player.data.inventory.items) player.data.inventory.items = []

  if (player.data.inventory.items.length === 0) {
    player.data.inventory.items.push({
      name: sellitem,
      amount: amount
    })
    return player
  }

  for (const item of player.data.inventory.items) {
    if (item.name === sellitem) {
      item.amount -= amount
      return player
    }
  }

  player.data.inventory.items.push({
    name: sellitem,
    amount: amount
  })
  return player
}

function getPrice(sellitem) {
  const itemprice = list.filter(item => item.name === sellitem)
  price = itemprice[0].price
  return price
}

async function getPrice1(bzname) {
  const response = await fetch(`https://api.slothpixel.me/api/skyblock/bazaar/${bzname}`);
  return await response.json();
}
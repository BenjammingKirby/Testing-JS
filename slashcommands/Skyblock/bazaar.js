const Discord = require('discord.js');
const fetch = require('node-fetch');
const list = require('../../constants/Skyblock/items.json');
const Fuse = require('fuse.js')
const fs = require('fs')
const list2 = require('./list2.json')

module.exports = {
  name: "Bazaar",
  description: "Get Bazaar Data for an item",
  usage: "bazzar (item)",
  perms: "None",
  folder: "Skyblock",
  aliases: ['bz'],
  async execute(interaction) {

    Object.keys(list).forEach(key => list[key].bazaar ? list2[key] = list[key] : "");


    var method = 'save';

    let result = interaction.options.getString('item');

    const waiting = new Discord.MessageEmbed()
      .setTitle('Checking Bazaar Data')
      .setFooter('If I don\'t respond within 10 Seconds then the Item wasn\'t found or an Error occurred')

    const wait = await interaction.editReply({ embeds: [waiting] })

    var apiData = await getApiData(result, method);

    if (apiData.error) {



      const options = {
        isCaseSensitive: false,
        treshold: 0.7,
        keys: [
          "name",
        ]
      };

      const fuse = new Fuse(Object.keys(list2), options);

      const pattern = result

      const itemlist = await fuse.search(pattern)


      result = itemlist[0].item;
    }

    var apiData = await getApiData(result, method)


    const notfound = new Discord.MessageEmbed()
      .setTitle(`Couldnt find Item ${result}`)

    if (apiData.error) {
      wait.edit({ embeds: [notfound] })
    }


    //Related Items
    var related = ''
    if (apiData.related === undefined) {
      related = 'None'
    } else if (apiData.related.length === 0) {
      related = 'None'
    } else {
      related = apiData.related
    }


    return wait.edit({
      embeds: [
        new Discord.MessageEmbed()
          .setTitle(`Bazaar Data for ${result}`)
          .setColor('7CFC00')
          .setAuthor(result, `https://sky.lea.moe/item/${result}`, `https://api.slothpixel.me/api/skyblock/bazaar/${result}`)
          .addFields(
            { name: `Insta Sell Price`, value: `${toFixed(apiData.quick_status.sellPrice)}`, inline: true },
            { name: `Amount of Sell Offers`, value: `${toFixed(apiData.quick_status.sellOrders)}`, inline: true },
            { name: `Amount of Items in Sell Offers`, value: `${apiData.quick_status.sellVolume}`, inline: true },
            { name: `Insta Buy Price`, value: `${toFixed(apiData.quick_status.buyPrice)}`, inline: true },
            { name: `Amount of Buy Offers`, value: `${toFixed(apiData.quick_status.buyOrders)}`, inline: true },
            { name: `Amount of Items in Buy Offers`, value: `${apiData.quick_status.buyVolume}`, inline: true },
            { name: `Related Items`, value: `${related}`, inline: false },

          )
      ]
    })
  }
};

async function getApiData(result) {
  delete require.cache[require.resolve('../../config.json')];
  const config = require('../../config.json');

  const response = await fetch(`https://api.slothpixel.me/api/skyblock/bazaar/${result}?key=${config.apikey}`);
  return await response.json();
}

function toFixed(num) {
  var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (2 || -1) + '})?');
  return num.toString().match(re)[0];
}
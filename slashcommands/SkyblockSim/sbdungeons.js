const { MessageButton, MessageActionRow, MessageEmbed } = require('discord.js');
const playerStats = require('../../constants/Simulator/Functions/playerStats.js')
const classLevel = require('../../constants/Simulator/Functions/dungeonlevel.js')
const skillLevel = require('../../constants/Simulator/Functions/skilllvl.js')
const lt = require('../../constants/Simulator/LootTables/loottables.js')
const dungloot = require('../../constants/Simulator/Json/dungeonloot.json')

module.exports = {
  name: "sbdungeons",
  description: "Settings for SkyblockSim",
  usage: "sbsettings (Setting Name)",
  perms: "None",
  folder: "SkyblockSim",
  aliases: [],
  cooldown: 10,
  async execute(interaction, mclient) {

    const movePlayer = (movement, ignoreEvent) => {
      let [x, y] = location

      if (movement === 'up') {
        var a = x - 1
        var b = y
      } else if (movement === 'left') {
        var a = x
        var b = y - 1
      } else if (movement === 'right') {
        var a = x
        var b = y + 1
      } else if (movement === 'down') {
        var a = x + 1
        var b = y
      }
      if (map[a][b] == 0 || ((map[a][b] == 3 || map[a][b] == 4 || map[a][b] == 6) && !ignoreEvent)) return [location, false]

      map[x][y] = 1

      location = [a, b]

      const puzzle = map[a][b] == 5 ? true : false
      map[a][b] = 2
      return [location, puzzle]
    }
    const mapArray = () => {
      let string = ''
      let index = 0
      for (const row of map) {
        for (const item of row) {
          index++
          if (item == 0) string += wall
          else if (item == 1 || item == 5) string += air
          else if (item == 2) string += Player
          else if (item == 3) string += puzzle
          else if (item == 4) string += enemy
          else if (item == 6) string += door
          // reset the row
          if (index == map[0].length) index = 0, string += '\n'
        }
      }
      return string
    }
    const nearEnemy = () => {
      let [x, y] = location

      let oldX = map[x]
      let upX = map[x - 1]
      let downX = map[x + 1]

      if (!oldX || !upX || !downX) return false

      // Check if enemy is on the right
      if (oldX[y + 1] == 4) return [true, 'right']
      // Check if enemy is on the left
      if (oldX[y - 1] == 4) return [true, 'left']
      // Check if enemy is below
      if (downX[y] == 4) return [true, 'down']
      // Check if enemy is above
      if (upX[y] == 4) return [true, 'up']
      return false
    }
    const nearPuzzle = () => {
      let [x, y] = location

      let oldX = map[x]
      let upX = map[x - 1]
      let downX = map[x + 1]

      if (!oldX || !upX || !downX) return false

      // Check if puzzle is on the right
      if (oldX[y + 1] == 3) return [true, 'right']
      // Check if puzzle is on the left
      if (oldX[y - 1] == 3) return [true, 'left']
      // Check if puzzle is below
      if (downX[y] == 3) return [true, 'down']
      // Check if puzzle is above
      if (upX[y] == 3) return [true, 'up']
      return false
    }
    const nearDoor = () => {
      let [x, y] = location

      let oldX = map[x]
      let upX = map[x - 1]
      let downX = map[x + 1]

      if (!oldX || !upX || !downX) return false

      // Check if door is on the right
      if (oldX[y + 1] == 6) return [true, 'right']
      // Check if door is on the left
      if (oldX[y - 1] == 6) return [true, 'left']
      // Check if door is below
      if (downX[y] == 6) return [true, 'down']
      // Check if door is above
      if (upX[y] == 6) return [true, 'up']
      return false
    }
    const dmgtaken = (php, mdmg) => {
      php -= mdmg
      return php
    }
    const dmgdealt = (mhp, pdmg) => {
      mhp -= pdmg
      return mhp
    }
    const sleep = async (ms) => {
      return new Promise((resolve) => {
        setTimeout(resolve, ms)
      })
    }
    const isCrit = (critchance) => {
      return (Math.random() * 100 < critchance) ? true : false
    }
    const updateTTT = (x, y, user) => {
      const emoji = (user) ? '🟩' : '🟥'
      let txt = '', index = 0
      table[x][y] = emoji

      for (const row of table) {
        for (const column of row) {
          index++
          txt += ' **|** ' + column
          if (index % 3 == 0) txt += ' **|**\n'
        }
      }
      return txt
    }
    const wincheckTTT = () => {
      const [a, b, c] = table[0]
      const [d, e, f] = table[1]
      const [g, h, i] = table[2]

      if (a != fog && b != fog && c != fog && d != fog && e != fog && f != fog && g != fog && h != fog && i != fog) {
        if ((a == b && b == c && b != fog) || (a == d && d == g && d != fog) || (a == e && e == i && e != fog)) return [true, a]
        if ((d == e && e == f && e != fog) || (b == e && e == h && e != fog) || (g == e && e == c && e != fog)) return [true, e]
        if ((g == h && h == i && h != fog) || (c == f && f == i && f != fog)) return [true, i]
        else return [true, undefined]
      }
      if ((a == b && b == c && b != fog) || (a == d && d == g && d != fog) || (a == e && e == i && e != fog)) return [true, a]
      if ((d == e && e == f && e != fog) || (b == e && e == h && e != fog) || (g == e && e == c && e != fog)) return [true, e]
      if ((g == h && h == i && h != fog) || (c == f && f == i && f != fog)) return [true, i]
      else return [false, undefined]
    }
    const shuffle = (array) => {
      let currentIndex = array.length, randomIndex

      while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--

        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]]
      }

      return array
    }

    const collection = mclient.db('SkyblockSim').collection('Players')
    let player = await collection.findOne({ _id: interaction.user.id })

    const collection1 = mclient.db('SkyblockSim').collection('blockedchannels')

    if (!player) {
      const noprofile = new MessageEmbed()
        .setColor('RED')
        .setTitle('No Profile found')
        .setDescription(`Create a Profile using \`/sb start\``)
      return interaction.editReply({ embeds: [noprofile] })
    }

    //Checks if the Player already has an open Dungeon Run
    if (player.data.misc.in_dungeon) {
      const runopen = new MessageEmbed()
        .setTitle('Another Dungeon is already open somewhere.')
        .setDescription('The Dungeon automatically closes after 1 Minute of no input')
        .setColor('RED')
        .setFooter('Skyblock Simulator')
      return interaction.editReply({ embeds: [runopen] })
    }

    //Players Stats
    let type = 'combat'
    let pstats = playerStats(player, type) //Type decides what gear is needed for the Action

    let combatlvl = skillLevel(player.data.skills.combat).level

    let classlevel = classLevel(player.data.dungeons.class.selected.xp).level
    let catalevel = classLevel(player.data.dungeons.xp).level

    if (player.data.dungeons.class.selected.name == 'Assassin') {
      pstats.strength += 2 * classlevel
    } else if (player.data.dungeons.class.selected.name == 'Berserker') {
      pstats.strength += 1 * classlevel
      pstats.defense += 1 * classlevel
    } else if (player.data.dungeons.class.selected.name == 'Tank') {
      pstats.health += 2 * classlevel
      pstats.defense += 1 * classlevel
    }

    //Variables needed for the Map
    let map = ''
    let location = [1, 1]
    let score = 100
    let floor = ''

    //Vars needed for Chests
    let wood_loot = ''
    let gold_loot = ''
    let diamond_loot = ''
    let emerald_loot = ''
    let obsidian_loot = ''

    let f1_map = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0]
    ]
    let f2_map = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
    // sample floor 2 map
    f2_map = [
      [0, 0, 0, 6, 6, 0, 0, 0],
      [0, 2, 5, 1, 1, 0, 3, 0],
      [0, 3, 1, 1, 1, 0, 1, 0],
      [0, 4, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 0, 0, 1, 0],
      [0, 1, 1, 4, 0, 4, 1, 0],
      [0, 3, 1, 1, 0, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
    let f3_map = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]

    //Floor Selection
    const floors = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('f1')
          .setLabel('Floor 1')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('f2')
          .setLabel('Floor 2')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('f3')
          .setLabel('Floor 3')
          .setStyle('PRIMARY')
      )

    const floorSelect = new MessageEmbed()
      .setTitle('Dungeons Floor Selection')
      .setFooter('Skyblock Simulator')
      .setColor('GREY')
      .setDescription('**<:bonzo:852111493859115019> Floor 1 (Combat 10)**\n**<:scarff:852111493909446686> Floor 2 (Cata 4)**\n**<:professor:852111493952176148> Floor 3 (Cata 8)**')

    const menu = await interaction.editReply({ embeds: [floorSelect], components: [floors] })

    const filter = i => {
      i.deferUpdate()
      return i.user.id === interaction.user.id
    }

    await menu.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 60000 })
      .then(i => {
        const { customId: id } = i

        if (id == 'f1') map = f1_map, floor = 1
        else if (id == 'f2') map = f2_map, floor = 2
        else if (id === 'f3') map = f3_map, floor = 3
        else {
          const cancelled = new MessageEmbed()
            .setTitle('Menu Cancelled')
            .setColor('RED')
          menu.edit({ embeds: [cancelled], components: [] })
          return;
        }
      }).catch(err => menu.edit({ components: [] }))

    const invalidreqs = new MessageEmbed()
      .setTitle('Requirements not met.')
      .setDescription(`**Needed Requirements**\nFloor 1 -> Combat 10\nFloor 2 -> Catacombs 4\nFloor 3 -> Catacombs 8\n\n**Your Stats**\nCombat: ${combatlvl}\nCatacombs: ${catalevel}\n`)
      .setColor('RED')

    if (floor == 1 && combatlvl <= 15) {
      menu.edit({ embeds: [invalidreqs], components: [] })
      return;
    } else if (floor == 2 && catalevel <= 4) {
      menu.edit({ embeds: [invalidreqs], components: [] })
      return;
    } else if (floor == 3 && catalevel <= 8) {
      menu.edit({ embeds: [invalidreqs], components: [] })
      return;
    }

      //Sets the Player into the Dungeon so they cant open another run.
     await collection.updateOne(
         { _id: interaction.user.id },
         { $set: { "data.misc.in_dungeon": true } },
         { upsert: true }
     )
    await collection1.updateOne(
      { _id: interaction.channelId },
      { $set: { blocked: true, user: interaction.user.id } },
      { upsert: true })

    //Variables needed for movement
    const up = new MessageButton()
      .setCustomId('up')
      .setLabel('⬆️')
      .setStyle('PRIMARY')

    const down = new MessageButton()
      .setCustomId('down')
      .setLabel('⬇️')
      .setStyle('PRIMARY')

    const left = new MessageButton()
      .setCustomId('left')
      .setLabel('⬅️')
      .setStyle('PRIMARY')

    const right = new MessageButton()
      .setCustomId('right')
      .setLabel('➡️')
      .setStyle('PRIMARY')

    const attack = new MessageButton()
      .setCustomId('attack')
      .setLabel('⚔️')
      .setStyle('PRIMARY')
      .setDisabled(true)

    const interact = new MessageButton()
      .setCustomId('interact')
      .setLabel('🖐️')
      .setStyle('PRIMARY')
      .setDisabled(true)

    const cancel = new MessageButton()
      .setCustomId('cancel')
      .setLabel('️C️a️n️c️e️l️')
      .setStyle('DANGER')
    //Buttons for Loot
    const wood_button = new MessageButton()
      .setCustomId('wood')
      .setEmoji('882624301503754350')
      .setLabel('Chest')
      .setStyle('PRIMARY')
    const gold_button = new MessageButton()
      .setCustomId('gold')
      .setEmoji('869126927011708929')
      .setLabel('Chest')
      .setStyle('PRIMARY')
    const diamond_button = new MessageButton()
      .setCustomId('diamond')
      .setEmoji('869126926646788097')
      .setLabel('Chest')
      .setStyle('PRIMARY')
    const emerald_button = new MessageButton()
      .setCustomId('emerald')
      .setEmoji('869126927380779008')
      .setLabel('Chest')
      .setStyle('PRIMARY')
    const obsidian_button = new MessageButton()
      .setCustomId('obsidian')
      .setEmoji('869490639769853992')
      .setLabel('Chest')
      .setStyle('PRIMARY')

    const row1 = new MessageActionRow()
      .addComponents(attack, up, interact, cancel)
    const row2 = new MessageActionRow()
      .addComponents(left, down, right)
    const bossrow = new MessageActionRow()
      .addComponents(attack, interact, cancel)
    const lootrow = new MessageActionRow()
      .addComponents(wood_button, gold_button)

    const test = new MessageEmbed()
    test.setFooter('Skyblock Simulator')
    test.setColor('GREY')

    const Player = '🟩'
    const wall = '<:wall:876211886746636288>'
    const air = '<:air:876209923875303424>'
    const puzzle = '🟪'
    const enemy = '<:zombie:876573165751509023>'
    const door = '<:wooddoor:882163369174503435>'

    const puzzles = ['ttt', 'quiz']

    let critchance = pstats.crit_chance
    let php = pstats.health
    let mhp = (Math.random() < 0.5) ? 300 : 200 // Random mob hp at the moment
    let mdmg = (Math.random() < 0.5) ? 50 : 25 // Random mob hp at the moment

    test.setDescription(`🎯 Score: **${score}**\n\n${mapArray(map)}`)

    // If puzzle or door is near, interact button activates
    row1.components[2].disabled = nearPuzzle()[0] || nearDoor()[0] ? false : true
    // If enemy is near, fight button activates
    row1.components[0].disabled = nearEnemy()[0] ? false : true

    menu.edit({ embeds: [test], components: [row1, row2] })

    const collector = menu.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 1000 * 60 * 5 })

    const row3 = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('1')
          .setLabel('X')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('2')
          .setLabel('X')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('3')
          .setLabel('X')
          .setStyle('SECONDARY'),
      )
    const row4 = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('4')
          .setLabel('X')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('5')
          .setLabel('X')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('6')
          .setLabel('X')
          .setStyle('SECONDARY'),
      )
    const row5 = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('7')
          .setLabel('X')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('8')
          .setLabel('X')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('9')
          .setLabel('X')
          .setStyle('SECONDARY'),
      )
    const row6 = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('A')
          .setLabel('A')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('B')
          .setLabel('B')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('C')
          .setLabel('C')
          .setStyle('SECONDARY'),
      )

    const fog = '🌫️'
    let table = [
      [fog, fog, fog],
      [fog, fog, fog],
      [fog, fog, fog]
    ]

    const quizzes = [
      {
        question: `How many Skills are there in Hypixel Skyblock? (All Skills Included)`,
        options: [
          ['10', false], ['11', false], ['12', true]
        ]
      },
      {
        question: `How many Catacombs XP do you need for Level 50`,
        options: [
          ['569 Mil', true], ['560 Mil', false], ['575 Mil', false]
        ]
      },
      {
        question: `How many Pets are there?`,
        options: [
          ['50', false], ['54', false], ['51', true]
        ]
      },
      {
        question: `Who is the Owner of Hypixel?`,
        options: [
          ['hypxel', false], ['hpixel', false], ['hypixel', true]
        ]
      },
      {
        question: `How many Talisman are there?`,
        options: [
          ['76', true], ['70', false], ['73', false]
        ]
      },
      {
        question: `Which non Boss and non Slayer Mini-Boss Mob has the highest HP?`,
        options: [
          ['Voidling Extremist', true], ['Voidling Fanatic', false], ['Voidling Fnatic', false]
        ]
      },
      {
        question: `How many Areas are there? (Excluding Sub Areas)`,
        options: [
          ['20', false], ['22', true], ['24', false]
        ]
      }
    ]

    let quiz, randomOptions

    let inTTT = false, inQuiz = false, runFailed = false, runCancelled = false, bossFight = false, atLoot = false, runFinished = false

    collector.on('collect', async i => {
      const { customId: id } = i

      if (inTTT) {
        let x, y
        if (test.fields.length > 0) {
          test.fields = [] // remove the addition field like the "killed a mod with x hp left"
          menu.edit({ embeds: [test] })
        }

        if (id == 1) x = 0, y = 0
        else if (id == 2) x = 0, y = 1
        else if (id == 3) x = 0, y = 2
        else if (id == 4) x = 1, y = 0
        else if (id == 5) x = 1, y = 1
        else if (id == 6) x = 1, y = 2
        else if (id == 7) x = 2, y = 0
        else if (id == 8) x = 2, y = 1
        else if (id == 9) x = 2, y = 2

        test.description = updateTTT(x, y, true)

        if (x == 0) {
          if (y == 0) row3.components[0].disabled = true
          else if (y == 1) row3.components[1].disabled = true
          else if (y == 2) row3.components[2].disabled = true
        } else if (x == 1) {
          if (y == 0) row4.components[0].disabled = true
          else if (y == 1) row4.components[1].disabled = true
          else if (y == 2) row4.components[2].disabled = true
        } else if (x == 2) {
          if (y == 0) row5.components[0].disabled = true
          else if (y == 1) row5.components[1].disabled = true
          else if (y == 2) row5.components[2].disabled = true
        }

        let rowPick = [0, 1, 2][Math.floor(Math.random() * 3)]
        let columnPick = [0, 1, 2][Math.floor(Math.random() * 3)]

        while (table[rowPick][columnPick] != fog) {
          rowPick = [0, 1, 2][Math.floor(Math.random() * 3)]
          columnPick = [0, 1, 2][Math.floor(Math.random() * 3)]
        }

        if (rowPick == 0) {
          if (columnPick == 0) row3.components[0].disabled = true
          else if (columnPick == 1) row3.components[1].disabled = true
          else if (columnPick == 2) row3.components[2].disabled = true
        } else if (rowPick == 1) {
          if (columnPick == 0) row4.components[0].disabled = true
          else if (columnPick == 1) row4.components[1].disabled = true
          else if (columnPick == 2) row4.components[2].disabled = true
        } else if (rowPick == 2) {
          if (columnPick == 0) row5.components[0].disabled = true
          else if (columnPick == 1) row5.components[1].disabled = true
          else if (columnPick == 2) row5.components[2].disabled = true
        }

        let [W, E] = wincheckTTT()

        if (W) {
          const txt = (E == '🟩') ? `You Won!!` : ((E) ? `You Lost ...` : `You Tied`)
          if (E == '🟩' || !E) {
            inTTT = false
            score += 30
            await menu.edit({ embeds: [test], components: [row1, row2] })
            await sleep(1000)
            test.description = `🎯 Score: **${score}** (+30)` + '\n\n' + mapArray()

            table = [
              [fog, fog, fog],
              [fog, fog, fog],
              [fog, fog, fog]
            ] // reset table for new tictactoe
            row1.components[2].disabled = true
            row3.components[0].disabled = false
            row3.components[1].disabled = false
            row3.components[2].disabled = false
            row4.components[0].disabled = false
            row4.components[1].disabled = false
            row4.components[2].disabled = false
            row5.components[0].disabled = false
            row5.components[1].disabled = false
            row5.components[2].disabled = false // reset components for new tictactoe
            return await menu.edit({ embeds: [test], components: [row1, row2] })
          } else {
            runFailed = false
            inTTT = false
            score -= 30
            test.description = `🎯 Score: **${score}** (-30)` + '\n\n' + mapArray()
            table = [
              [fog, fog, fog],
              [fog, fog, fog],
              [fog, fog, fog]
            ] // reset table for new tictactoe
            row1.components[2].disabled = true
            row3.components[0].disabled = false
            row3.components[1].disabled = false
            row3.components[2].disabled = false
            row4.components[0].disabled = false
            row4.components[1].disabled = false
            row4.components[2].disabled = false
            row5.components[0].disabled = false
            row5.components[1].disabled = false
            row5.components[2].disabled = false // reset components for new tictactoe
            return await menu.edit({ embeds: [test], components: [row1, row2] })
          }
        }

        test.description = updateTTT(rowPick, columnPick, false)

        let [w, e] = wincheckTTT()

        if (w) {
          const txt = (e == '🟩') ? `You Won!!` : ((e) ? `You Lost ...` : `You Tied`)
          if (e == '🟩' || !e) {
            inTTT = false
            test.description += `\n${txt}`
            await menu.edit({ embeds: [test], components: [row1, row2] })
            await sleep(1000)
            test.description = `🎯 Score: **${score}**` + '\n\n' + mapArray()

            table = [
              [fog, fog, fog],
              [fog, fog, fog],
              [fog, fog, fog]
            ] // reset table for new tictactoe
            row1.components[2].disabled = true
            row3.components[0].disabled = false
            row3.components[1].disabled = false
            row3.components[2].disabled = false
            row4.components[0].disabled = false
            row4.components[1].disabled = false
            row4.components[2].disabled = false
            row5.components[0].disabled = false
            row5.components[1].disabled = false
            row5.components[2].disabled = false // reset components for new tictactoe
            return await menu.edit({ embeds: [test], components: [row1, row2] })
          } else {
            runFailed = false
            inTTT = false
            score -= 30
            test.description = `🎯 Score: **${score}** (-30)` + '\n\n' + mapArray()
            table = [
              [fog, fog, fog],
              [fog, fog, fog],
              [fog, fog, fog]
            ] // reset table for new tictactoe
            row1.components[2].disabled = true
            row3.components[0].disabled = false
            row3.components[1].disabled = false
            row3.components[2].disabled = false
            row4.components[0].disabled = false
            row4.components[1].disabled = false
            row4.components[2].disabled = false
            row5.components[0].disabled = false
            row5.components[1].disabled = false
            row5.components[2].disabled = false // reset components for new tictactoe
            return await menu.edit({ embeds: [test], components: [row1, row2] })
          }
        }
        await menu.edit({ embeds: [test], components: [row3, row4, row5] })
      } else if (inQuiz) {
        if (test.fields.length > 0) {
          test.fields = []  // remove the addition field like the "killed a mod with x hp left"
          menu.edit({ embeds: [test] })
        }

        let rightChoise = '', i = 0

        for (const option of randomOptions) {
          i++
          if (option[1]) rightChoise = i
        }

        if (rightChoise == 1) rightChoise = 'A'
        else if (rightChoise == 2) rightChoise = 'B'
        else if (rightChoise == 3) rightChoise = 'C'

        if (id == rightChoise) {
          inQuiz = false
          await menu.edit({ embeds: [test], components: [row1, row2] })
          await sleep(1000)
          score += 30
          test.description = `🎯 Score: **${score}** (+30)` + '\n\n' + mapArray()

          return await menu.edit({ embeds: [test], components: [row1, row2] })
        } else {
          runFailed = false
          inQuiz = false
          score -= 30
          test.description = `🎯 Score: **${score}** (-30)` + '\n\n' + mapArray()
          await menu.edit({ embeds: [test], components: [row1, row2] })
        }
      } else if (id == 'up' || id == 'left' || id == 'right' || id == 'down') {
        const locationAndPuzzleCheck = movePlayer(id, false)
        location = locationAndPuzzleCheck[0]
        var puzzleOrNot = locationAndPuzzleCheck[1]
        test.fields = []
        test.description = `🎯 Score: **${score}**` + '\n\n' + mapArray()

      } else if (id == 'attack') {
        const direction = nearEnemy()[1]
        let fightEnded = false

        if (bossFight) {
          let pdmg = Math.floor((5 + pstats.damage) * (1 + (pstats.strength / 100)) * (1 + (combatlvl * 0.04)))

          const crit = isCrit(critchance) //Change Variable for Crit Chance and change way how crit returns
          if (crit) pdmg = Math.floor(pdmg * (1 + pstats.crit_damage / 100))

          php = dmgtaken(php, mdmg) //php = player health, pdmg = playerdmg
          mhp = dmgdealt(mhp, pdmg) //mhp = mob health, mdmg = mod damage

          if (php < 0) php = 0 // Avoid negative health
          if (mhp < 0) mhp = 0 // Avoid negative health

          test.fields = []
          test.addField(`Battle`, `Player Health: ❤️ ${php} (- ${mdmg})
                Boss Health: ❤️ ${mhp} (-${crit ? '<:crit:870306942806020106>' : ''} ${pdmg})`)

          menu.edit({ embeds: [test], components: [bossrow] })

          if (mhp <= 0) {
            fightEnded = true
            test.fields = []
            test.setColor('ORANGE')
            test.addField(`\u200B`, `Killed the Boss with **❤️ ${php}** left and earned Combat XP`) //Add combat xp var
            await collection.updateOne( //Add Combat XP from enemy Kill (do once mobs decided)
              { _id: interaction.user.id },
              { $inc: { "data.skills.combat": 500 } },
              { upsert: true })

            menu.edit({ embeds: [test], components: [bossrow] })

            await sleep(1000) // waiting a second so you can actually read the message

          } else if (php <= 0) {
            test.fields = []
            test.setColor('RED')
            test.addField(`\u200B`, `Died to the Boss which had **❤️ ${mhp}** left.`)
            runFailed = true
            return collector.stop()
          }
          if (fightEnded) {
            fightEnded = false
            wood_loot = lt.wood.roll(pstats.magic_find)
            gold_loot = lt.gold.roll(pstats.magic_find)
            test.fields = []
            test.description = '\n'
            test.description += `<:oak_wood:882624301503754350> Wood Chest: **${wood_loot}\n**`
            test.description += `<:gold:869126927011708929> Gold Chest: **${gold_loot}\n**`
            if (floor == 2 && score >= 160) {
              diamond_loot = lt.diamond.roll(pstats.magic_find)
              test.description += `<:diamond:869126926646788097> Diamond Chest: **${diamond_loot}\n**`
              lootrow.addComponents(diamond_button)
            } else if (floor == 3 >= 200) {
              diamond_loot = lt.diamond.roll(pstats.magic_find)
              emerald_loot = lt.emerald_loot(pstats.magic_find)
              test.description += `Diamond Chest: **${diamond_loot}\n**`
              test.description += `Emerlad Chest: **${emerald_loot}\n**`
              lootrow.addComponents(diamond_button, emerald_button)
            }
            test.setColor('FFD700')
            atLoot = true
            menu.edit({ embeds: [test], components: [lootrow] }) //add row for chests
          }
        } else {



          // START FIGHT 
          let pdmg = Math.floor((5 + pstats.damage) * (1 + (pstats.strength / 100)) * (1 + (combatlvl * 0.04)))

          const crit = isCrit(critchance) //Change Variable for Crit Chance and change way how crit returns
          if (crit) pdmg = Math.floor(pdmg * (1 + pstats.crit_damage / 100))

          php = dmgtaken(php, mdmg) //php = player health, pdmg = playerdmg
          mhp = dmgdealt(mhp, pdmg) //mhp = mob health, mdmg = mod damage

          if (php < 0) php = 0 // Avoid negative health
          if (mhp < 0) mhp = 0 // Avoid negative health

          test.fields = []
          test.addField(`Battle`, `Player Health: ❤️ ${php} (- ${mdmg})
                Mob Health: ❤️ ${mhp} (-${crit ? '<:crit:870306942806020106>' : ''} ${pdmg})`)

          // when still in fight locks movement so he can't get out the fight
          row1.components[1].disabled = true // up arrow
          row2.components[0].disabled = true // left arrow
          row2.components[1].disabled = true // down arrow
          row2.components[2].disabled = true // right arrow

          menu.edit({ embeds: [test], components: [row1, row2] })

          if (mhp <= 0) {
            fightEnded = true
            score += 20
            test.fields = []
            test.setColor('ORANGE')
            test.addField(`\u200B`, `Killed the Enemy with **❤️ ${php}** left and earned Combat XP`) //Add combat xp var
            await collection.updateOne( //Add Combat XP from enemy Kill (do once mobs decided)
              { _id: interaction.user.id },
              { $inc: { "data.skills.combat": 50 } },
              { upsert: true })

            php = pstats.health //reset player health
            mhp = (Math.random() < 0.5) ? 300 : 200 // reset mob hp for new mob
            mdmg = (Math.random() < 0.5) ? 50 : 25 // reset mob dmg for new mob

            // Unlocks arrows after mob is killed
            row1.components[0].disabled = true
            row1.components[1].disabled = false // up arrow
            row2.components[0].disabled = false // left arrow
            row2.components[1].disabled = false // down arrow
            row2.components[2].disabled = false // right arrow
            menu.edit({ embeds: [test], components: [row1, row2] })

            await sleep(1000) // waiting a second so you can actually read the message
          } else if (php <= 0) {
            test.fields = []
            test.setColor('RED')
            test.addField(`\u200B`, `Died to the Enemy which had **❤️ ${mhp}** left.`)
            runFailed = true
            return collector.stop()
          }
          // FINISH FIGHT

          if (fightEnded) {
            location = movePlayer(direction, true)[0] // replace the mob emoji only after mob is killed
            test.description = `🎯 Score: **${score}** (+20)` + '\n\n' + mapArray()
          }
          test.description = `🎯 Score: **${score}**` + '\n\n' + mapArray()
          menu.edit({ embeds: [test], components: [row1, row2] }) // Components need to get adjusted might be wrong
        }
      } else if (id == 'interact') {
        if (nearDoor()[0]) {
          // Lock arrows
          bossFight = true
          bossrow.components[0].disabled = false
          if (floor == 1) mhp = 500, mdmg = 100
          else if (floor == 2) mhp = 1000, mdmg = 200
          else if (floor == 3) mhp = 2500, mdmg = 350
          test.fields = []
          test.addField(`Battle`, `Player Health: ❤️ ${php}
                Mob Health: ❤️ ${mhp}`)
          await menu.edit({ embeds: [test], components: [bossrow] })
          const direction = nearDoor()[1]
        } else {
          const direction = nearPuzzle()[1]

          // START PUZZLE
          let puzzle = puzzles[Math.floor(Math.random() * puzzles.length)] // get random puzzle
          if (puzzle == 'ttt') {
            inTTT = true
            const randomPick = [[0, 1, 2][Math.floor(Math.random() * 3)], [0, 1, 2][Math.floor(Math.random() * 3)]]
            const [rowPick, columnPick] = randomPick

            test.setDescription(updateTTT(rowPick, columnPick, false))

            if (rowPick == 0) {
              if (columnPick == 0) row3.components[0].disabled = true
              else if (columnPick == 1) row3.components[1].disabled = true
              else if (columnPick == 2) row3.components[2].disabled = true
            } else if (rowPick == 1) {
              if (columnPick == 0) row4.components[0].disabled = true
              else if (columnPick == 1) row4.components[1].disabled = true
              else if (columnPick == 2) row4.components[2].disabled = true
            } else if (rowPick == 2) {
              if (columnPick == 0) row5.components[0].disabled = true
              else if (columnPick == 1) row5.components[1].disabled = true
              else if (columnPick == 2) row5.components[2].disabled = true
            }

            await menu.edit({ embeds: [test], components: [row3, row4, row5] })
          } else if (puzzle == 'quiz') {
            inQuiz = true

            quiz = quizzes[Math.floor(Math.random() * quizzes.length)] // Gets random quiz
            console.log(quiz)
            randomOptions = shuffle(quiz.options) // Shuffle the asnwers

            let answers = '', index = 0

            for (const option of randomOptions) { // Create the randomized asnwers messsage
              const [choise, correct] = option // Example: [ choise = 10, correct = false ]
              index++
              if (index == 1) answers += `A) ${choise}\n`
              else if (index == 2) answers += `B) ${choise}\n`
              else if (index == 3) answers += `C) ${choise}`
            }

            test.addField(quiz.question, answers, false)
            await menu.edit({ embeds: [test], components: [row6] })
          }

          location = movePlayer(direction, true)[0] // replace the mob emoji only after mob is killed
          if (!inTTT && !inQuiz) test.description = `🎯 Score: **${score}**` + '\n\n' + mapArray()
        }
      } else if (id == 'cancel') {
        runCancelled = true
        return collector.stop()
      }

      // If puzzle or door is near, interact button activates
      row1.components[2].disabled = nearPuzzle()[0] || nearDoor()[0] ? false : true
      // If enemy is near, fight button activates
      row1.components[0].disabled = nearEnemy()[0] ? false : true

      //Adding the USER the loot
      if (atLoot) {
        let loot = ''
        let choosen = false
        if (id == 'wood') {
          loot = wood_loot
          choosen = true
        } else if (id == 'gold') {
          loot = gold_loot
          choosen = true
        } else if (id == 'diamond') {
          loot = diamond_loot
          choosen = true
        } else if (id == 'emerald') {
          loot = emerald_loot
          choosen = true
        } else if (id == 'obsidian') {

        }
        if (!isNaN(loot) && choosen == true) {
          loot = Number(loot)
          await collection.updateOne(
            { _id: interaction.user.id },
            { $inc: { 'data.profile.coins': loot } },
            { upsert: true })

          const lootembed = new MessageEmbed()
            .setTitle(`Floor ${floor} Finished`)
            .setDescription(`<:coins:861974605203636253> **${loot}** Coins added to your Profile.`)
            .setColor('GREEN')
            .setFooter('Skyblock Simulator')
          menu.edit({ embeds: [lootembed], components: [] })
          runFinished = true
          collector.stop()
        } else if (loot == 'Recombobulator 3000' && choosen == true) {
          let sellitem = loot
          let amount = 1
          player = await collection.findOne({ _id: interaction.user.id })

          const updatePlayer = addItem(sellitem, amount, player)

          await collection.replaceOne(
            { _id: interaction.user.id },
            updatePlayer
          )

          const lootembed = new MessageEmbed()
            .setTitle(`Floor ${floor} Finished`)
            .setDescription(`<:recomb:881094744183275540> **${loot}** added to your Profile.`)
            .setColor('GREEN')
            .setFooter('Skyblock Simulator')
          menu.edit({ embeds: [lootembed], components: [] })
          runFinished = true
          collector.stop()
        } else {
                  if(loot.includes('Armor') && choosen == true) {
            //handle armor here
            let item = dungloot[loot]
            let item2 = player.data.inventory.armor.find(armors => armors.name == loot)

            if(item2 && item2.name == loot) {
              await collection.updateOne(
            { _id: interaction.user.id },
            { $inc: { 'data.profile.coins': item.coins } },
            { upsert: true })
            const lootembed = new MessageEmbed()
            .setTitle(`Floor ${floor} Finished`)
            .setDescription(`You already own <:tank:852079613051666472> **${loot}** so i added you <:coins:861974605203636253> **${num(item.coins)}** Coins to your Profile.`)
            .setColor('GREEN')
            .setFooter('Skyblock Simulator')
          menu.edit({ embeds: [lootembed], components: [] })
              runFinished = true
              collector.stop()
            } else {

            await collection.updateOne(
          { _id: interaction.user.id },
          { $push: { "data.inventory.armor": { "name": loot, "health": item.health, "defense": item.defense, "strength": item.strength, "crit_chance": item.crit_chance, "crit_damage": item.crit_damage, "magic_find": item.magic_find, "sea_creature_chance": item.sea_creature_chance, "recombobulated": item.recombobulated }}},
          {upsert: true })

          const lootembed = new MessageEmbed()
            .setTitle(`Floor ${floor} Finished`)
            .setDescription(`<:tank:852079613051666472> **${loot}** added to your Profile.`)
            .setColor('GREEN')
            .setFooter('Skyblock Simulator')
          menu.edit({ embeds: [lootembed], components: [] })
          runFinished = true
          collector.stop()
            }
          } else if((loot.includes('Sword') || loot.includes('Death') || loot.includes('Blade') || loot.includes('Dagger')) && choosen == true) {
            //handle sword here
            let item = dungloot[loot]
            let item2 = player.data.inventory.sword.find(swords => swords.name == loot)

            if(item2 && item2.name == loot) {
              await collection.updateOne(
            { _id: interaction.user.id },
            { $inc: { 'data.profile.coins': item.coins } },
            { upsert: true })
            const lootembed = new MessageEmbed()
            .setTitle(`Floor ${floor} Finished`)
            .setDescription(`You already own <:berserker:852079613052059658> **${loot}** so i added you <:coins:861974605203636253> **${num(item.coins)}** Coins to your Profile.`)
            .setColor('GREEN')
            .setFooter('Skyblock Simulator')
          menu.edit({ embeds: [lootembed], components: [] })
              runFinished = true
              collector.stop()
            } else {

            await collection.updateOne(
          { _id: interaction.user.id },
          { $push: { "data.inventory.sword": { "name": loot, "damage": item.damage, "strength": item.strength, "crit_chance": item.crit_chance, "crit_damage": item.crit_damage, "recombobulated": item.recombobulated }}},
          {upsert: true })

          const lootembed = new MessageEmbed()
            .setTitle(`Floor ${floor} Finished`)
            .setDescription(`<:berserker:852079613052059658> **${loot}** added to your Profile.`)
            .setColor('GREEN')
            .setFooter('Skyblock Simulator')
          menu.edit({ embeds: [lootembed], components: [] })
          runFinished = true
          collector.stop()
            }
          }
        }
      }

      // check if on a secret
      if (puzzleOrNot) {
        test.addField('Secret Found', '\u200B')
        score += 20
        test.description = `🎯 Score: **${score}** (+20)` + '\n\n' + mapArray()
      }
      if (!inTTT && !inQuiz && !bossFight) return test.setColor('GREY'), menu.edit({ embeds: [test], components: [row1, row2] })
    })
    collector.on('end', async collected => {
      try {
        await collection.updateOne(
          { _id: interaction.user.id },
          { $set: { "data.misc.in_dungeon": false } },
          { upsert: true })

        await collection1.updateOne(
      { _id: interaction.channelId },
      { $set: { blocked: false } },
      { upsert: true })
        test.fields = []
        if (runFailed) {
          test.addField('Dungeon Run Over', '**Reason**\n* Failed Puzzle\n* Died to Mob')
        } else if (runCancelled) {
          test.addField('Dungeon Run Over', '**Reason**\n* Timed out\n* Cancelled')
        } else if (runFinished) {
          return;
        }
        test.setColor('RED')
        await menu.edit({ embeds: [test], components: [] })
      } catch (e) {

      }
    })
  }
}

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
      item.amount += amount
      return player
    }
  }

  player.data.inventory.items.push({
    name: sellitem,
    amount: amount
  })
  return player
}

num = (num) => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/.0$/, '') + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/.0$/, '') + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/.0$/, '') + 'K'
  return num
}
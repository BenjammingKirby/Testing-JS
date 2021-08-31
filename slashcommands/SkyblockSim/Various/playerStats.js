function playerStats(player, type, cookie) {

  //Base Variables
  let stats = player.data.stats
  let inv = ''
  let inv2 = ''

  //Base Stats
  let health = stats.health
  let defense = stats.defense
  let damage = stats.damage
  let strength = stats.strength
  let crit_chance = stats.crit_chance
  let crit_damage = stats.crit_damage
  let magic_find = stats.magic_find
  let sea_creature_chance = stats.sea_creature_chance


  //Combat Stats
  if (type == 'combat') {
    inv = player.data.equipment.combat


    health += inv.armor.health

    defense += inv.armor.defense

    damage += inv.sword.damage

    strength += inv.sword.strength + inv.armor.strength

    crit_chance += inv.sword.crit_chance + inv.armor.crit_chance

    crit_damage += inv.sword.crit_damage + inv.armor.crit_damage
  } else if (type == 'all') {
    inv = player.data.equipment.combat
    inv2 = player.data.equipment.fishing


    health += inv.armor.health

    defense += inv.armor.defense

    damage += inv.sword.damage

    strength += inv.sword.strength + inv.armor.strength

    crit_chance += inv.sword.crit_chance + inv.armor.crit_chance

    crit_damage += inv.sword.crit_damage + inv.armor.crit_damage

    sea_creature_chance += inv2.armor.sea_creature_chance + inv2.rod.sea_creature_chance
  }

  //Add Booster Cookie Stats
  if (cookie == true) {
    health = Math.floor(health * 1.1)
    defense = Math.floor(defense * 1.1)
    damage = Math.floor(damage * 1.1)
    strength = Math.floor(strength * 1.1)
    crit_chance = Math.floor(crit_chance * 1.1)
    crit_damage = Math.floor(crit_damage * 1.1)
    magic_find += 10
    magic_find = Math.floor(magic_find * 1.1)
    sea_creature_chance = Math.floor(sea_creature_chance * 1.1)
  }

  health = Math.floor(health * (1 + defense / 100))

  return {
    health,
    defense,
    damage,
    strength,
    crit_chance,
    crit_damage,
    magic_find,
    sea_creature_chance
  }
}

module.exports = playerStats
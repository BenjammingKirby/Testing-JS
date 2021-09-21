const LootTable = require('../../LootTable.js')

const gold = new LootTable()

gold.addItem('4000', 66, false)
gold.addItem('6000', 66, false)
gold.addItem('10000', 66, false)
gold.addItem('Recombobulator 3000', 1, true)
gold.addItem('Rotten Armor', 5, true)
gold.addItem('Skeleton Master Armor', 3, true)
gold.addItem('Silent Death', 4, true)
gold.addItem('Zombie Knight Sword', 3, true)


module.exports = gold
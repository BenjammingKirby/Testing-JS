const LootTable = require('../../LootTable.js')

const blazing3 = new LootTable()

blazing3.addItem('Magma Cream', 50, false)
blazing3.addItem('Ghast Tear', 50, false)
blazing3.addItem('Enchanted Magma Cream', 1, true)
blazing3.addItem('Enchanted Ghast Tear', 1 , true)

module.exports = blazing3
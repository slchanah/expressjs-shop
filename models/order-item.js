const Sequelize = require('sequelize')
const sequelize = require('../utils/database')

const OrderItem = sequelize.define('order_item',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        quantity: Sequelize.INTEGER
    })

module.exports = OrderItem
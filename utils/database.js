// const mysql = require('mysql2')

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'Udemy_ExpressJS',
//     password: 'a753951852'
// })

// module.exports = pool.promise()

const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('Udemy_ExpressJS', 'root', 'a753951852', {
    dialect: 'mysql',
    host: 'localhost'
})

module.exports = sequelize
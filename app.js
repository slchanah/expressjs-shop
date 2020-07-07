const express = require('express');
const path = require('path')
const rootDir = require('./utils/path')
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRouter = require('./routes/shop')
const errorController = require('./controller/error')
const sequelize = require('./utils/database')
const Product = require('./models/products')
const User = require('./models/user')

const app = express();

app.set("view engine", 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded())
app.use(express.static(path.join(rootDir, 'public')))

app.use('/admin', adminRoutes)

app.use(shopRouter)

app.use(errorController.get404)

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Product)

sequelize
    // .sync({ force: true })
    .sync()
    .then(result => {
        // console.log(result)
        return User.count()
    })
    .then(result => {
        if (result == 0) {
            User.create({ name: 'Ivan', email: 'ivan@email.com' })
        }
        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    })
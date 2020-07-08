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
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-item');

const app = express();

app.set("view engine", 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded())
app.use(express.static(path.join(rootDir, 'public')))

app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user
            next()
        })
        .catch(err => { console.log(err) })
})

app.use('/admin', adminRoutes)

app.use(shopRouter)

app.use(errorController.get404)

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Product)
User.hasOne(Cart)
Cart.belongsTo(User)
Cart.belongsToMany(Product, { through: CartItem })
Product.belongsToMany(Cart, { through: CartItem })
Order.belongsTo(User)
User.hasMany(Order)
Order.belongsToMany(Product, { through: OrderItem })

sequelize
    // .sync({ force: true })
    .sync()
    .then(result => {
        // console.log(result)
        return User.count()
    })
    .then(result => {
        if (result == 0) {
            return User.create({ name: 'Ivan', email: 'ivan@email.com' })
        }
        return User.findByPk(1)
    })
    .then(user => {
        return user.getCart()
            .then(cart => {
                if (!cart) {
                    return user.createCart()
                }
                else {
                    return Promise.resolve(cart)
                }
            })
            .catch(err => { console.log(err) })
    })
    .then(cart => {
        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    })
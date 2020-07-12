const express = require('express');
const path = require('path')
const rootDir = require('./utils/path')
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRouter = require('./routes/shop')
const errorController = require('./controller/error')
const mongoConnect = require('./utils/database').mongoConnect
const User = require('./models/user')

const app = express();

app.set("view engine", 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded())
app.use(express.static(path.join(rootDir, 'public')))

app.use((req, res, next) => {
    User.findByPk("5f0a908b9a919fba4af56b25")
        .then(user => {
            req.user = new User(user.username, user.email, user.cart ? user.cart : { item: [] }, user._id.toString())
            next()
        })
        .catch(err => { console.log(err) })
})

app.use('/admin', adminRoutes)

app.use(shopRouter)

app.use(errorController.get404)

mongoConnect(client => {
    app.listen(3000)
})
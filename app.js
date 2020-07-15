const express = require('express');
const path = require('path')
const rootDir = require('./utils/path')
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRouter = require('./routes/shop')
const errorController = require('./controller/error')
const mongoose = require('mongoose')
const User = require('./models/user')

const app = express();

app.set("view engine", 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded())
app.use(express.static(path.join(rootDir, 'public')))

app.use((req, res, next) => {
    User.findById("5f0ec537dbb4ea26731f3e8d")
        .then(user => {
            req.user = user
            next()
        })
        .catch(err => { console.log(err) })
})

app.use('/admin', adminRoutes)

app.use(shopRouter)

app.use(errorController.get404)

mongoose.connect('mongodb+srv://ivan:a753951852@cluster0.y90jh.mongodb.net/shop?retryWrites=true&w=majority')
    .then(result => {
        return User.findOne()
            .then(user => {
                if (!user) {
                    const user = new User({
                        name: "Ivan",
                        email: "email",
                        cart: {
                            items: []
                        }
                    })
                    return user.save()
                }
            })
    })
    .then(result => {
        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    })
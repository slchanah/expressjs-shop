const express = require('express');
const path = require('path')
const rootDir = require('./utils/path')
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const shopRouter = require('./routes/shop')
const errorController = require('./controller/error')
const mongoose = require('mongoose')
const User = require('./models/user')
const authRouter = require('./routes/auth')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const isAuth = require('./middleware/is-auth')
const csrf = require('csurf')
const flash = require('connect-flash')
const mongodbUrl = require('./config/properties').MONGODB_URL

const app = express();

const MONGODB_URI = mongodbUrl
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})

const csrfProtection = csrf()

app.set("view engine", 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded())
app.use(express.static(path.join(rootDir, 'public')))
app.use(session({ secret: "secret", resave: false, saveUninitialized: false, store: store }))
app.use(csrfProtection)
app.use(flash())

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    next()
})

app.use((req, res, next) => {
    if (req.session.user) {
        User.findById(req.session.user._id)
            .then(user => {
                if (!user) {
                    return next()
                }
                req.user = user
                next()
            })
            .catch(err => {
                next(new Error(err))
            })
    }
    else {
        next()
    }
})

app.use('/admin', isAuth, adminRoutes)

app.use(shopRouter)

app.use(authRouter)

// app.get('/500', errorController.get500)

app.use(errorController.get404)

app.use((err, req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Errors',
        path: '500',
        isAuthenticated: req.session.isLoggedIn
    })
})

mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    })

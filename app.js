const express = require('express');
const path = require('path')
const fs = require('fs')
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
const multer = require('multer')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const https = require('https')

const app = express();

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@cluster0.y90jh.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})

const csrfProtection = csrf()

const key = fs.readFileSync('./server.key')
const cert = fs.readFileSync('./server.cert')

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    }
    else {
        cb(null, false)
    }
}

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' })

app.set("view engine", 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded())
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use(express.static(path.join(rootDir, 'public')))
app.use('/images', express.static(path.join(rootDir, 'images')))
app.use(session({ secret: "secret", resave: false, saveUninitialized: false, store: store }))
app.use(csrfProtection)
app.use(helmet())
app.use(compression())
app.use(flash())
app.use(morgan('combined', { stream: accessLogStream }))

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
        // https.createServer({ key, cert }, app).listen(process.env.PORT || 3000)
        app.listen(process.env.PORT || 3000)
    })
    .catch(err => {
        console.log(err)
    })

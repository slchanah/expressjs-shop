const bcrypt = require('bcryptjs')
const User = require('../models/user')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const crypto = require('crypto')
const { validationResult } = require('express-validator/check')
const SENDGRID_KEY = require('../config/properties').SENDGRID_KEY

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: SENDGRID_KEY
    }
}))

exports.getLogin = (req, res) => {
    let errorMessage = req.flash('error')
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
        oldData: {}
    })
}

exports.postLogin = (req, res) => {
    const email = req.body.email
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldData: { email: email }
        })
    }

    req.session.isLoggedIn = true
    req.session.user = req.flash('user')[0]
    req.session.save(err => {
        console.log(err)
        res.redirect('/')
    })
}

exports.postLogout = (req, res) => {
    req.session.destroy(err => {
        console.log(err)
        res.redirect('/')
    })
}

exports.postSignup = (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const confimPassword = req.body.confimPassword
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldData: { email: email },
            validationErrors: errors.array()
        })
    }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const newUser = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            })
            return newUser.save()
        })
        .then(result => {
            transporter.sendMail({
                to: email,
                from: 'chanivan0421@gmail.com',
                subject: 'Signup succeeded',
                html: '<h1>Signed up successfully</h1>'
            })
                .catch(err => err)
            return res.redirect('/login')
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.getSignup = (req, res) => {
    let errorMessage = req.flash('error')
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
        oldData: { email: '' },
        validationErrors: []
    })
}

exports.getResetPassword = (req, res) => {
    let errorMessage = req.flash('error')
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null
    })
}

exports.postResetPassword = (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
            return res.redirect('/reset')
        }

        const token = buffer.toString('hex')
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No such account')
                    return res.redirect('/reset')
                }
                user.resetToken = token
                user.resetTokenExpiration = Date.now() + 3600000
                return user.save()
                    .then(result => {
                        res.redirect('/')
                        transporter.sendMail({
                            to: req.body.email,
                            from: 'chanivan0421@gmail.com',
                            subject: 'Password Reset',
                            html: `<p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to reset password</p>`
                        })
                            .catch(err => err)
                    })
                    .catch(err => err)
            })
            .catch(err => {
                const error = new Error(err)
                error.httpStatusCode = 500
                return next(error)
            })
    })
}

exports.getNewPassword = (req, res) => {
    const token = req.params.token

    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let errorMessage = req.flash('error')
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
                userId: user._id.toString(),
                resetToken: token
            })
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

exports.postNewPassword = (req, res) => {
    const newPassword = req.body.password
    const userId = req.body.userId
    const token = req.body.token
    let updatedUser;

    User.findOne({ _id: userId, resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            updatedUser = user
            return bcrypt.hash(newPassword, 12)
        })
        .then(hashedPassword => {
            updatedUser.password = hashedPassword
            updatedUser.resetToken = undefined
            updatedUser.resetTokenExpiration = undefined
            return updatedUser.save()
        })
        .then(result => {
            res.redirect('/login')
        })
        .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

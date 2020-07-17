const express = require('express')
const authController = require('../controller/auth')
const { check, body } = require('express-validator/check')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

const router = express.Router()

router.get('/login', authController.getLogin)

router.post(
    '/login',
    body('email')
        .normalizeEmail()
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(user => {
                    if (!user) {
                        return Promise.reject('Invalid email')
                    }
                    return bcrypt.compare(req.body.password, user.password)
                        .then(isMatch => {
                            if (!isMatch) {
                                return Promise.reject('Invalid password')
                            }
                            else {
                                req.flash('user', user)
                            }
                        })
                })
        }),
    body('password')
        .trim(),
    authController.postLogin)

router.post('/logout', authController.postLogout)

router.get('/signup', authController.getSignup)

router.post(
    '/signup',
    [
        check('email')
            .normalizeEmail()
            .isEmail()
            .withMessage('Invalid Email')
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then(user => {
                        if (user) {
                            return Promise.reject('Email exists already')
                        }
                    })
            }),
        body('password', 'Please enter a password with only numbers and text and at least 5 characters')
            .trim()
            .isAlphanumeric()
            .isLength({ min: 5 }),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords have to match!')
                }
                return true
            })
    ],
    authController.postSignup)

router.get('/reset', authController.getResetPassword)

router.post('/reset', authController.postResetPassword)

router.get('/reset/:token', authController.getNewPassword)

router.post('/new-password', authController.postNewPassword)

module.exports = router
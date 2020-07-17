const express = require('express');
const adminController = require('../controller/admin')
const { body } = require('express-validator/check')

const router = express.Router()

// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post(
    '/add-product',
    [
        body('title', 'Invalid Title')
            .trim()
            .isString()
            .isLength({ min: 3 }),
        body('imageUrl', 'Invalid imageUrl')
            .isURL(),
        body('price', 'Invalid Price')
            .isFloat(),
        body('description', 'Invalid description')
            .trim()
            .isLength({ min: 5, max: 400 })
    ],
    adminController.postAddProduct);

router.post(
    '/edit-product',
    [
        body('title', 'Invalid Title')
            .trim()
            .isString()
            .isLength({ min: 3 }),
        body('imageUrl', 'Invalid imageUrl')
            .isURL(),
        body('price', 'Invalid price')
            .isFloat(),
        body('description', 'Invalid description')
            .trim()
            .isLength({ min: 5, max: 400 })
    ],
    adminController.postEditProduct)

router.get('/edit-product/:productId', adminController.getEditProduct)

router.post('/delete-product', adminController.postDeleteProduct)

module.exports = router
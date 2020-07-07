const fs = require('fs')
const path = require('path')
const rootDir = require('../utils/path')

const p = path.join(rootDir, 'data', 'cart.json')

module.exports = class Cart {
    static addProduct(id, price) {
        fs.readFile(p, (err, data) => {
            let cart = { products: [], totalPrice: 0 }
            if (!err) {
                cart = JSON.parse(data)
            }

            let existingProductIndex = cart.products.findIndex(product => product.id === id)
            let existingProduct = cart.products[existingProductIndex]
            let updatedProduct;

            if (existingProduct) {
                updatedProduct = { ...existingProduct }
                updatedProduct.qty += 1
                cart.products[existingProductIndex] = updatedProduct
            }
            else {
                updatedProduct = { id: id, qty: 1 }
                cart.products.push(updatedProduct)
            }
            cart.totalPrice += price

            fs.writeFile(p, JSON.stringify(cart), (err) => {
                if (err) {
                    console.log(err)
                }
            })
        })
    }

    static deleteProduct(id, price) {
        fs.readFile(p, (err, data) => {
            if (err) {
                return
            }

            const cart = JSON.parse(data)
            const product = cart.products.find(product => product.id === id)
            if (product !== undefined) {
                const productQty = product.qty

                cart.products = cart.products.filter(product => product.id !== id)
                cart.totalPrice -= price * productQty

                fs.writeFile(p, JSON.stringify(cart), err => {
                    if (err) {
                        console.log(err)
                    }
                })
            }
        })
    }

    static getCart(callback) {
        fs.readFile(p, (err, data) => {
            if (err) {
                console.log(err)
            }
            else {
                callback(JSON.parse(data))
            }
        })
    }
}
const fs = require('fs')
const path = require('path')
const rootDir = require('../utils/path')
const Cart = require('./cart')

const p = path.join(rootDir, 'data', 'products.json')

const getProductsFromFile = callback => {
    fs.readFile(p, (err, data) => {
        if (err) {
            callback([])
        }
        else {
            callback(JSON.parse(data))
        }
    })
}

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {
            if (this.id) {
                const existingProductIndex = products.findIndex(product => product.id === this.id)
                products[existingProductIndex] = this
            }
            else {
                this.id = Math.random().toString()
                products.push(this)
            }
            fs.writeFile(p, JSON.stringify(products), (err) => {
                console.log(err)
            })
        })
    }

    static fetchAll(callback) {
        getProductsFromFile(callback)
    }

    static findById(id, callback) {
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id)
            callback(product)
        })
    }

    static deleteById(id) {
        getProductsFromFile(products => {
            const product = products.find(product => product.id === id)
            products = products.filter(product => product.id !== id)
            fs.writeFile(p, JSON.stringify(products), (err) => {
                if (err) {
                    console.log(err)
                    return
                }
                Cart.deleteProduct(id, product.price)
            })
        })
    }
}
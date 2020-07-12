const mongodb = require('mongodb')
const getDb = require('../utils/database').getDb

class User {
    constructor(username, email, cart, id) {
        this.username = username
        this.email = email
        this.cart = cart
        this._id = id
    }

    addToCart(product) {
        const cartProductIndex = this.cart.item.findIndex(p => p.productId.toString() === product._id.toString())

        if (cartProductIndex >= 0) {
            this.cart.item[cartProductIndex].quantity++
        }
        else {
            this.cart.item = [...this.cart.item, { productId: new mongodb.ObjectId(product._id), quantity: 1 }]
        }

        const db = getDb()
        return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: this.cart } })
    }

    getCart() {
        const db = getDb()
        const productIds = this.cart.item.map(i => i.productId)
        return db.collection('products').find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p,
                        quantity: this.cart.item.find(i => i.productId.toString() === p._id.toString()).quantity
                    }
                })
            })
            .catch(err => { console.log(err) })
    }

    deleteItemFromCart(productId) {
        const db = getDb()
        this.cart.item = this.cart.item.filter(i => i.productId.toString() !== productId.toString())
        return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: this.cart } })
    }

    addToOrder() {
        const db = getDb()
        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new mongodb.ObjectId(this._id),
                        username: this.username
                    }
                }
                return db.collection('orders').insertOne(order)
            })
            .then(result => {
                this.cart = { item: [] }
                return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: this.cart } })
            })
            .catch(err => {
                console.log(err)
            })
    }

    getOrders() {
        const db = getDb()
        return db.collection('orders').find({ 'user._id': new mongodb.ObjectId(this._id) }).toArray()
    }

    save() {
        const db = getDb()
        return db.collection('users').insertOne(this)
    }

    static findByPk(userId) {
        const db = getDb()
        return db.collection('users').findOne({ _id: new mongodb.ObjectId(userId) })
    }
}

module.exports = User
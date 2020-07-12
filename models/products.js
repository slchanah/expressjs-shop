const getDb = require('../utils/database').getDb
const mongodb = require('mongodb')

class Product {
    constructor(title, price, imageUrl, description, id, userId) {
        this.title = title
        this.price = price
        this.imageUrl = imageUrl
        this.description = description
        this._id = id ? new mongodb.ObjectId(id) : null
        this.userId = userId
    }

    save() {
        const db = getDb()
        if (this._id) {
            return db.collection('products').updateOne({ _id: this._id }, { $set: this })
        }
        else {
            return db.collection('products').insertOne(this)
        }
    }

    static fetchAll() {
        const db = getDb()
        return db.collection('products').find().toArray()
    }

    static findByPk(productId) {
        const db = getDb()
        return db.collection('products').findOne({ _id: new mongodb.ObjectId(productId) })
    }

    static deleteById(productId) {
        const db = getDb()
        return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(productId) })
    }
}

module.exports = Product
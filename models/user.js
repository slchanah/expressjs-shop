const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items:
            [
                {
                    productId: {
                        type: Schema.Types.ObjectId,
                        require: true,
                        ref: 'Product'
                    },
                    quantity: {
                        type: Number,
                        require: true
                    }
                }
            ]
    }
})

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(p => p.productId.toString() === product._id.toString())

    if (cartProductIndex >= 0) {
        this.cart.items[cartProductIndex].quantity++
    }
    else {
        this.cart.items = [...this.cart.items, { productId: product._id, quantity: 1 }]
    }

    return this.save()
}

userSchema.methods.deleteFromCart = function (productId) {
    this.cart.items = this.cart.items.filter(i => i.productId.toString() !== productId)
    return this.save()
}

userSchema.methods.clearCart = function () {
    this.cart = { items: [] }
    return this.save()
}

module.exports = mongoose.model('User', userSchema)
const Product = require('../models/products');
const Order = require('../models/order')

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list',
        {
          prods: products,
          pageTitle: 'All Products',
          path: '/products',

        })
    })
    .catch(err => {
      console.log(err)
    })
};

exports.getProduct = (req, res) => {
  const prodId = req.params.productId
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        pageTitle: product.title,
        product: product,
        path: '/products',

      })
    })
    .catch(err => { console.log(err) })
}

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log(products)
      res.render('shop/index',
        {
          prods: products,
          pageTitle: 'Shop',
          path: '/'
        })
    })
    .catch(err => {
      console.log(err)
    })
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId', '-userId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        // const product = (({ _id, title, price, description, imageUrl }) => ({ _id, title, price, description, imageUrl }))(i.productId)
        const product = i.productId
        console.log(product)
        product.quantity = i.quantity
        return product
      })
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      })
    })
    .catch(err => {
      console.log(err)
    })
};

exports.postCart = (req, res) => {
  const prodId = req.body.productId
  Product.findById(prodId)
    .then(product =>
      req.user.addToCart(product)
    )
    .then(result => {
      console.log("Updated Cart")
      res.redirect('/cart')
    })
    .catch(err => { console.log(err) })
}

exports.postCartDelete = (req, res) => {
  const productId = req.body.productId
  req.user.deleteFromCart(productId)
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => { console.log(err) })
}

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      console.log(orders)
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => { console.log(err) })
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const productData = user.cart.items.map(i => ({ product: { ...i.productId._doc }, quantity: i.quantity }))
      const order = new Order({
        productData,
        user: {
          email: user.email,
          userId: user._id
        }
      })
      return order.save()
    })
    .then(result => {
      return req.user.clearCart()
    })
    .then(result => {
      res.redirect('/orders')
    })
    .catch(err => { console.log(err) })
}

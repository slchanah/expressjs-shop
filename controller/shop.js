const Product = require('../models/products');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/product-list',
        {
          prods: products,
          pageTitle: 'All Products',
          path: '/products'
        })
    })
    .catch(err => {
      console.log(err)
    })
};

exports.getProduct = (req, res) => {
  const prodId = req.params.productId
  Product.findByPk(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        pageTitle: product.title,
        product: product,
        path: '/products'
      })
    })
    .catch(err => { console.log(err) })
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
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
  req.user.getCart()
    .then(products => {
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
  Product.findByPk(prodId)
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
  req.user.deleteItemFromCart(productId)
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => { console.log(err) })
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders()
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
  req.user.addToOrder()
    .then(result => {
      res.redirect('/orders')
    })
    .catch(err => { console.log(err) })
}

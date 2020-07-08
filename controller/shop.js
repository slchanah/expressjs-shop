const Product = require('../models/products');
const Cart = require('../models/cart')

exports.getProducts = (req, res, next) => {
  Product.findAll()
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
    .then((product) => {
      res.render('shop/product-detail', {
        pageTitle: product.title,
        product: product,
        path: '/products'
      })
    })
    .catch(err => { console.log(err) })
}

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
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
    .then(cart => {
      return cart.getProducts()
    })
    .then(products => {
      console.log(products)
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => { console.log(err) })
};

exports.postCart = (req, res) => {
  const prodId = req.body.productId
  req.user.getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: prodId } })
        .then(products => {
          if (products.length > 0) {
            return cart.addProduct(products[0], { through: { quantity: products[0].cart_item.quantity + 1 } })
          }
          else {
            return Product.findByPk(prodId)
              .then(product => {
                return cart.addProduct(product, { through: { quantity: 1 } })
              })
              .catch(err => { console.log(err) })
          }
        })
        .catch(err => { console.log(err) })
    })
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => { console.log(err) })
}

exports.postCartDelete = (req, res) => {
  const productId = req.body.productId
  req.user.getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: productId } })
    })
    .then(products => {
      return products[0].cart_item.destroy()
    })
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => { console.log(err) })
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};

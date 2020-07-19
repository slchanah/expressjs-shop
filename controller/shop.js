const Product = require('../models/products');
const Order = require('../models/order')
const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')

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
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
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
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
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
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
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
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
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
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.postCartDelete = (req, res) => {
  const productId = req.body.productId
  req.user.deleteFromCart(productId)
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
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
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
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
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId

  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found'))
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'))
      }

      const invoiceName = `invoice-${orderId}.pdf`
      const invoicePath = path.join('data', 'invoices', invoiceName)

      const pdfDoc = new PDFDocument()

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`)

      pdfDoc.pipe(fs.createWriteStream(invoicePath))
      pdfDoc.pipe(res)

      pdfDoc.fontSize(26).text('Invoice')
      pdfDoc.fontSize(16).text('--------------------------')

      let totalPrice = 0
      order.productData.forEach(prod => {
        pdfDoc.fontSize(14).text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`)
        totalPrice += prod.quantity * prod.product.price
      })

      pdfDoc.fontSize(16).text('--------------------------')
      pdfDoc.fontSize(16).text(`Total Price: $${totalPrice}`)

      pdfDoc.end()

      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err)
      //   }
      //   else {
      //     res.setHeader('Content-Type', 'application/pdf')
      //     res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`)
      //     res.send(data)
      //   }
      // })

      // const file = fs.createReadStream(invoicePath)
      // file.pipe(res)
    })
    .catch(err => {
      next(err)
    })
}
const Product = require('../models/products');
const ImageUrl = require('../config/imageUrl')
const { validationResult } = require('express-validator')
const Mongoose = require('mongoose')
const fileHepler = require('../utils/file')

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    errorMessage: null,
    errors: false,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req)

  if (!image) {
    return res.status(422).render('admin/edit-product', {
      path: '/admin/add-product',
      pageTitle: 'Add Product',
      errorMessage: 'Attached file is not an image',
      editing: false,
      errors: true,
      product: { title: title, price: price, description: description },
      validationErrors: []
    })
  }

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      path: '/admin/add-product',
      pageTitle: 'Add Product',
      errorMessage: errors.array()[0].msg,
      editing: false,
      errors: true,
      product: { title: title, imageUrl: imageUrl, price: price, description: description },
      validationErrors: errors.array()
    })
  }

  const imageUrl = image.path

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  })
  product.save()
    .then(result => {
      console.log("Added")
      res.redirect('/admin/products')
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId
  Product.findById(prodId)
    .then(product => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: true,
        product: product,
        errorMessage: null,
        errors: false,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
};

exports.postEditProduct = (req, res) => {
  const productId = req.body.productId
  const title = req.body.title;
  const image = req.file
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      path: '/edit-product',
      pageTitle: 'Edit Product',
      errorMessage: errors.array()[0].msg,
      editing: true,
      product: { _id: productId, title: title, price: price, description: description },
      errors: true,
      validationErrors: errors.array()
    })
  }

  Product.findById(productId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/')
      }
      product.title = title
      if (image) {
        fileHepler.deleteFile(product.imageUrl)
        product.imageUrl = image.path
      }
      product.price = price
      product.description = description
      return product.save()
        .then(result => {
          console.log("UPDATED!")
          res.redirect('/admin/products')
        })
        .catch(err => err)
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select('price title -_id')
    // .populate('userId', 'name')
    .then(products => {
      console.log(products)
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
};

exports.postDeleteProduct = (req, res) => {
  const productId = req.body.productId

  Product.findOne({ _id: productId, userId: req.user._id.toString() })
    .then(product => {
      if (!product) {
        return next(new Error('Product not found'))
      }

      fileHepler.deleteFile(product.imageUrl)
      return Product.deleteOne({ _id: productId, userId: req.user._id.toString() })
    })
    .then(result => {
      console.log("DESTROYED!")
      res.redirect('/admin/products')
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

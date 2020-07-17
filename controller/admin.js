const Product = require('../models/products');
const ImageUrl = require('../config/imageUrl')
const { validationResult } = require('express-validator')

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
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    console.log(errors)
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
      console.log(err)
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
    .catch(err => { console.log(err) })
};

exports.postEditProduct = (req, res) => {
  const productId = req.body.productId
  const title = req.body.title;
  const imageUrl = req.body.imageUrl
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      path: '/edit-product',
      pageTitle: 'Edit Product',
      errorMessage: errors.array()[0].msg,
      editing: true,
      product: { _id: productId, title: title, imageUrl: imageUrl, price: price, description: description },
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
      product.imageUrl = imageUrl
      product.price = price
      product.description = description
      return product.save()
        .then(result => {
          console.log("UPDATED!")
          res.redirect('/admin/products')
        })
        .catch(err => { console.log(err) })
    })
    .catch(err => { console.log(err) })
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
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res) => {
  const productId = req.body.productId
  Product.deleteOne({ _id: productId, userId: req.user._id.toString() })
    .then(result => {
      console.log("DESTROYED!")
      res.redirect('/admin/products')
    })
    .catch(err => { console.log(err) })
}

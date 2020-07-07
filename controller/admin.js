const Product = require('../models/products');
const ImageUrl = require('../config/imageUrl')

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = (req.body.imageUrl === '') ? ImageUrl : req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  Product.create({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description
  })
    .then(result => {
      console.log(result)
      res.redirect('/admin/products')
    })
    .catch(err => {
      console.log(err)
    })

};

exports.getEditProduct = (req, res, next) => {
  Product.findByPk(req.params.productId)
    .then(product => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: true,
        product: product
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

  Product.findByPk(productId)
    .then(product => {
      product.title = title
      product.price = price
      product.imageUrl = imageUrl
      product.description = description
      return product.save() // return a Promise
    })
    .then(result => {
      console.log("UPDATED!")
      res.redirect('/admin/products')
    })
    .catch(err => { console.log(err) })
}

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
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
  Product.findByPk(productId)
    .then(product => {
      return product.destroy()
    })
    .then(result => {
      console.log("DESTROYED!")
      res.redirect('/admin/products')
    })
    .catch(err => { console.log(err) })
}

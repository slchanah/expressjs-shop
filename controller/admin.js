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
  const product = new Product(title, price, imageUrl, description, null, req.user._id)
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
  Product.findByPk(prodId)
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

  const product = new Product(title, price, imageUrl, description, productId)
  product.save()
    .then(result => {
      console.log("UPDATED!")
      res.redirect('/admin/products')
    })
    .catch(err => { console.log(err) })
}

exports.getProducts = (req, res, next) => {
  // Product.findAll()
  Product.fetchAll()
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
  Product.deleteById(productId)
    .then(result => {
      console.log("DESTROYED!")
      res.redirect('/admin/products')
    })
    .catch(err => { console.log(err) })
}

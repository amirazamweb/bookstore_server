const express = require('express');
const router = express.Router();
const formidable = require('express-formidable');
const { createProductController,
    allProductController,
    getSingleProductController,
    productPhotoController,
    categoryProductController,
    similarProductController,
    filterController,
    searchController,
    deleteProductController,
    updateProductController,
    braintreeTokenController,
    braintreePaymentController,
    allOrdersController,
    singleOrderController,
    updateOrderStatusController } = require('../controllers/productController');

// create ||post
router.post('/create', formidable(), createProductController);

// get all products || get
router.get('/all', allProductController)

// get single product
router.get('/single-product/:slug', getSingleProductController)

// product photo
router.get('/photo/:pid', productPhotoController)

// category product
router.get('/category/:slug', categoryProductController)

// similar products
router.get('/similar-products/:slug', similarProductController)

// filter products
router.get('/filter/:slug', filterController)

// search product
router.post('/search', searchController)

// update product
router.put('/update/:slug', formidable(), updateProductController)

// delete product
router.delete('/delete/:slug', deleteProductController);

// payment route
// token
router.get('/braintree/token', braintreeTokenController);

// payments
router.post('/braintree/payment', braintreePaymentController)

// all orders
router.get('/all-orders', allOrdersController)

// single order
router.get('/single-order/:id', singleOrderController)

// update order status
router.put('/update-order/:id', updateOrderStatusController)

module.exports = router;
const ProductModel = require('../models/productModel');
const OrdrModel = require('../models/orderModel');
const slugify = require('slugify');
const fs = require('fs');
const dotenv = require('dotenv');
const braintree = require('braintree');
const orderModel = require('../models/orderModel');

dotenv.config();

// gateway

var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

// create product
const createProductController = async (req, res) => {
    try {
        const { name, author, description, category, price, quantity } = req.fields;
        const { cover } = req.files;
        // const existing product
        const existingProduct = await ProductModel.findOne({ name }).select({ cover: 0 });
        if (existingProduct) {
            return res.status(200).send({
                success: false,
                message: 'Product already created'
            })
        }

        // create new product
        const product = new ProductModel({
            name,
            author,
            description,
            category,
            price,
            quantity,
            categorySlug: slugify(category).toLowerCase(),
            productSlug: slugify(name).toLowerCase()
        })

        if (cover) {
            product.cover.data = fs.readFileSync(cover.path);
            product.cover.contentType = cover.type
        }

        // save the product to database
        product.save();

        res.status(201).send({
            success: true,
            message: 'Product created successfully'
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while creating product'
        })
        console.log(error);
    }
}

// get all products
const allProductController = async (req, res) => {
    try {
        const products = await ProductModel.find({}).select({ cover: 0 }).sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            message: 'all product list',
            products
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while getting all product'
        })
        console.log(error);
    }
}

// get single product
const getSingleProductController = async (req, res) => {
    try {
        const product = await ProductModel.findOne({ productSlug: req.params.slug }).select({ cover: 0 });
        res.status(200).send({
            success: true,
            message: 'single product',
            product
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while getting single product'
        })
        console.log(error);
    }
}

// product photo
const productPhotoController = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.pid).select({ cover: 1 });
        res.set('Content-type', product?.cover.contentType);
        res.send(product?.cover.data);
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while getting product photo'
        })
        console.log(error);
    }
}

// category product
const categoryProductController = async (req, res) => {
    try {
        const products = await ProductModel.find({ categorySlug: req.params.slug }).select({ cover: 0 });
        res.status(200).send({
            success: true,
            message: 'category product list',
            products
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while getting category product'
        })
        console.log(error);
    }
}

// similar products
const similarProductController = async (req, res) => {
    try {
        const product = await ProductModel.findOne({ productSlug: req.params.slug }).select({ cover: 0 });
        const similarProducts = await ProductModel.find
            ({ category: product.category, _id: { $nin: [product._id] } })
            .select({ cover: 0 });
        res.status(200).send({
            success: true,
            message: 'Similar products list',
            products: similarProducts
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while getting similar product'
        })
        console.log(error);
    }
}

// filter product
const filterController = async (req, res) => {
    try {
        const products = await ProductModel.find({ category: req.params.slug }).select({ cover: 0 });
        res.status(200).send({
            success: true,
            message: 'Filtered product',
            products
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while getting filter product'
        })
        console.log(error);
    }
}

// search
const searchController = async (req, res) => {
    try {
        const { keyword } = req.body;
        const results = await ProductModel.find({
            $or: [{ name: { $regex: keyword, $options: 'i' } },
            { author: { $regex: keyword, $options: 'i' } }]
        }).select({ cover: 0 });
        res.json(results);
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while searching product'
        })
        console.log(error);
    }
}

// update product
const updateProductController = async (req, res) => {
    try {
        const { cover } = req.files;

        const productData = await ProductModel.findOne({ productSlug: req.params.slug }).select({ cover: 0 });

        // get the product
        const productToBeUpdate = {
            ...req.fields,
            categorySlug: req.fields.category ? slugify(req.fields.category).toLowerCase() : productData.categorySlug,
            productSlug: req.fields.name ? slugify(req.fields.name).toLowerCase() : productData.productSlug
        }

        if (cover) {
            productToBeUpdate.cover = { data: '', contentType: '' };
            productToBeUpdate.cover.data = fs.readFileSync(cover.path);
            productToBeUpdate.cover.contentType = cover.type
        }

        const newProduct = await ProductModel.findByIdAndUpdate(productData._id, { ...productToBeUpdate }).select({ cover: 0 });
        res.status(200).send({
            success: true,
            message: 'Product updated successfully'
        })

    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while updating product'
        })
        console.log(error);
    }
}

// delete product
const deleteProductController = async (req, res) => {
    try {
        const product = await ProductModel.deleteOne({ productSlug: req.params.slug }).select({ cover: 0 });
        res.status(200).send({
            success: true,
            message: 'Product deleted successfully'
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while deleting product'
        })
        console.log(error);
    }
}

// payment gateway api token
const braintreeTokenController = async (req, res) => {
    try {
        gateway.clientToken.generate({}, function (err, response) {
            if (err) {
                res.status(500).send(err)
            }
            else {
                res.send(response)
            }
        })
    } catch (error) {
        es.status(500).send({
            success: false,
            message: 'Error while getting gateway token'
        })
        console.log(error);
    }
}

//payment
const braintreePaymentController = (req, res) => {
    try {
        const { cart, nonce } = req.body;
        console.log(req.body);
        let total = 0;
        cart.map((i) => { total += i.price });
        let newTransaction = gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true
            }
        },
            function (error, result) {
                if (result) {
                    const order = new OrdrModel({
                        products: cart,
                        payment: result,
                        buyer: req.body._id
                    }).save();
                    res.json({ ok: true })
                }
                else {
                    res.status(500).send(error)
                }
            }
        )
    } catch (error) {
        console.log(error);
    }
}

// all orders
const allOrdersController = async (req, res) => {
    try {
        const orders = await OrdrModel.find({})
            .populate('buyer', '-profileImg -password')
            .populate('products', '-cover').sort({ createdAt: -1 })
        res.json(orders);
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while getting all orders'
        })
        console.log(error);
    }
}

// single order
const singleOrderController = async (req, res) => {
    try {
        const orders = await OrdrModel.find({ buyer: req.params.id })
            .populate('buyer', '-profileImg -password')
            .populate('products', '-cover').sort({ createdAt: -1 })
        res.json(orders);
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while getting all orders'
        })
        console.log(error);
    }
}

// update order Status
const updateOrderStatusController = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send({ ok: true })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while updating order status'
        })
        console.log(error);
    }
}

module.exports = {
    createProductController,
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
    updateOrderStatusController
};
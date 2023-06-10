const ProductModel = require('../models/productModel');
const slugify = require('slugify');
const fs = require('fs');

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
        const products = await ProductModel.find({}).select({ cover: 0 }).sort({ createdAt: -1 }).limit(15);
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

module.exports = {
    createProductController,
    allProductController,
    getSingleProductController,
    productPhotoController,
    categoryProductController,
    similarProductController,
    filterController,
    searchController
};
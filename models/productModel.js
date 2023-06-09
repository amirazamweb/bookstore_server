const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    cover: {
        data: Buffer,
        contentType: String
    },
    category: {
        type: String,
        required: true
    },
    categorySlug: {
        type: String,
        required: true
    },
    productSlug: {
        type: String,
        required: true
    }
}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('Book', bookSchema);
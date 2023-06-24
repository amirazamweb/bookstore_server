let mongoose = require('mongoose');

let orderSchema = new mongoose.Schema({
    products: [
        {
            type: mongoose.ObjectId,
            ref: 'Book'
        }
    ],
    payment: {},
    buyer: {
        type: mongoose.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        default: 'Not Process',
        enum: ['Not Process', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    }
}, { timestamps: true, versionKey: false })

module.exports = mongoose.model('Order', orderSchema);
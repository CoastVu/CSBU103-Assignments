const mongoose = require('mongoose');

const motorbikeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    brand: {
        type: String,
        required: true,
        index: true
    },
    cc: {
        type: Number,
        required: true,
        index: true
    },
    price: {
        type: Number,
        required: true,
        index: true
    },

    description: {
        type: String,
        required: true,
        index: true
    },

    imageUrl: String
});

module.exports = mongoose.model('Motorbike', motorbikeSchema, 'motorbikes');
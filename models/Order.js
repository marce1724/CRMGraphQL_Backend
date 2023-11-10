const mongoose = require('mongoose')

const ProductSchema = mongoose.Schema({

    order:{
        type: Array,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Client'
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    state:{
        type: String,
        default: "PENDING"
    },
    created:{
        type: Date,
        default: Date.now()
    }

});



module.exports = mongoose.model('Order', ProductSchema)
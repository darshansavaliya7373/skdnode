var mongoose = require('mongoose')
var user = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    authority:{
        type: Array,
        required: true,
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('user', user)
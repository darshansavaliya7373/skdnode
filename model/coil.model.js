var mongoose = require('mongoose')
var coil = new mongoose.Schema({
    date: {
        type: String,
    },
    shift: {
        type: String,
        enum: ["night", "day"],
        required: true
    },
    operator: {
        type: String,
        required: true
    },
    helper: {
        type: String,
        required: true
    },
    winder1: {
        type: String,
        required: true
    },
    winder2: {
        type: String,
        required: true
    },
    data: [{
        coilno: {
            type: String,
            required: true,
        },
        mm: {
            type: String,
            required: true,
        },
        meter: {
            type: String,
            required: true,
        },
        weight: {
            type: String,
            required: true,
        },
        palateno: {
            type: String,
        },
        remark: {
            type: String,
            required: true,
        },
        mainid: {
            type: String,
            required: true,
        }
    }]
}, {
    timestamps: true
})

module.exports = mongoose.model('coil', coil)
var mongoose = require('mongoose')
var mm = new mongoose.Schema({
    mm: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('mm', mm)
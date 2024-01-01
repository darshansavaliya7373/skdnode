var mongoose = require('mongoose')
var chalan = new mongoose.Schema({
    coilsid: [{
        type: mongoose.Types.ObjectId
    }],
}, {
    timestamps: true
})

module.exports = mongoose.model('chalan', chalan)
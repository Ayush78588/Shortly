const mongoose = require('mongoose');
const { type } = require('os');
const urlSchema = mongoose.Schema({
    shortId: {
        type: String,
        required: true,
        unique: true
    },
    redirUrl: {
        type: String,
        required: true
    },
    visited: {
        require: true,
        type: Number
    },
    details:{
        required:true,
        type: []
    }
});
module.exports = mongoose.model('url', urlSchema);
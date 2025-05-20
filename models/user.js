const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        require: true,
        unique: true 
    },
    password:{
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    isEmailVerified: {
        requiired:true,
        type: Boolean
    }
});
module.exports = mongoose.model('user',userSchema);
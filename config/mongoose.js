const mongoose = require('mongoose');
const MONGODB_URL = process.env.MONGODB_URL;


mongoose.connect(MONGODB_URL, { timeoutMS: 30000 })
.then(function(){
    console.log('DB Connected!');
})
.catch(function(err){
    console.log(err.message);
});
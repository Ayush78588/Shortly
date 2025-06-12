const jwt = require('jsonwebtoken');
const userModel = require('../models/user');



async function isLoggedIn(req,res,next) {
    let token = req.cookies.token;
    if (token) {
        let data = jwt.verify(token, process.env.JWT_SECRET);
        let user = await userModel.findOne({ email: data.email });
        if(!user){
            return res.redirect('/login');
        }
        req.user=user;
        next();
    }
    else {
        return res.redirect('/login');
    }
}

module.exports = isLoggedIn;
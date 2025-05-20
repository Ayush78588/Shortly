let obj = require('dotenv').config();
console.log(process.env.PORT, process.env.MONGODB_URL);
const express = require('express');
require('./config/mongoose');
const cp = require('cookie-parser');
const controller = require('./controller');
const PORT = process.env.PORT || 4000;



const app = express();
app.use(cp());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/login', controller.handleLoginPage);
app.get('/register', controller.handleRegisterPage);
app.post('/register', controller.handleRegister);
app.post('/login', controller.handleLogin);
app.get('/', controller.handleHomePage);
app.get('/logout', controller.handleLogOut);
app.post('/shorturl', controller.handleGenerateShortURL);
app.get('/track', controller.handleShowTrackPage);
app.post('/shorturltracking', controller.handleTrackingDetails);
app.get('/about', controller.handleAboutPage);
app.get('/profile', controller.handleProfilePage);
app.get('/verifyemail/:token', controller.handleAccountVerification);
app.get('/resend-link/:token', controller.handleResendLink);
app.get('/user/forgot-password', controller.handleForgotPasswordPage);
app.post("/user/forgot-password", controller.handleForgotPassword);
app.get('/reset-password/:token', controller.handleResetPasswordPage);
app.post('/reset-password/:token', controller.handleResetPassword);
app.get('/:sid', controller.handleRedirectShortUrl);
app.get('/profile/edit', controller.handleEditProfile);
app.post('/profile/edit/save', controller.handleSaveProfileDetails);

app.listen(PORT);

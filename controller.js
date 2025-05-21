const urlModel = require('./models/url');
const shortId = require('short-id');
const userModel = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('./utils/nodemailer');

const JWT_SECRET = process.env.JWT_SECRET;




function handleLoginPage(req, res) {
    res.render('login', { warning: false });
}

function handleRegisterPage(req, res) {
    res.render('register', { email: false });
}

async function handleRegister(req, res) {
    try {
        let { email, password, name, age } = req.body;
        let user = await userModel.findOne({ email });
        if (user) {
            return res.render('register', { email: true });
        }
        let salt = await bcrypt.genSalt();
        let hpw = await bcrypt.hash(password, salt);
        await userModel.create({ email, password: hpw, name, age, isEmailVerified: false });

        let token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '10m' });
        await sendEmail('signup-verification', { name, email, token });
        res.render('verify-account');


    }
    catch (err) {
        console.log(err.message);
        res.send(err.message);
    };
}

async function handleAccountVerification(req, res) {
    try {
        let token = req.params.token;
        console.log(token);
        let data = jwt.verify(token, JWT_SECRET);
        await userModel.findOneAndUpdate({ email: data.email }, { isEmailVerified: true });

        res.render('confirmation-page');
    }
    catch (err) {
        res.send('Link expired! <br> Please Login to get verification link again.');
    }

}

async function handleLogin(req, res) {
    try {
        let { email, password } = req.body;
        let user = await userModel.findOne({ email });
        if (!user) {
            return res.render('login', { warning: true });
        }

        if (!user.isEmailVerified) {
            const token = jwt.sign({ email }, JWT_SECRET);
            return res.render('verify-pending', { token });
        }
        let bol = await bcrypt.compare(password, user.password);
        if (!bol) {
            return res.render('login', { warning: true });
        }
        const token = jwt.sign({ email }, JWT_SECRET);
        res.cookie('token', token);
        res.redirect('/');
    }
    catch (err) {
        res.send(err.message);
    }
}

async function handleGenerateShortURL(req, res) {
    try {
        let user = await isLoggedIn(req.cookies.token);
        if (user) {
            let sid = shortId.generate();
            await urlModel.create({
                shortId: sid,
                redirUrl: req.body.url,
                visited: 0,
                details: []
            });

            res.render('shorturl', { sid, user });
        } else {
            res.render('shorturl', { user })
        }
    } catch (err) {
        res.send(err.message);
    }

}

function handleLogOut(req, res) {
    res.cookie('token', '');
    res.redirect('/');
}

async function handleRedirectShortUrl(req, res) {
    try {
        let sid = req.params.sid;
        function format(n) {
            if (n < 10) {
                return "0" + n;
            }
            else {
                return n
            }
        }
        let dt = new Date();
        let fullDate = `${format(dt.getDate())}-${format(dt.getMonth() + 1)}-${dt.getFullYear()}`;
        let time = `${format(dt.getHours()+5)}:${format(dt.getMinutes()+30)}:${format(dt.getSeconds())}`;

        let url = await urlModel.findOne({ shortId: sid });
        if (!url) {
            return res.send('Invalid Short URL');
        }
        url.visited++;
        url.details.push({ visit: url.visited, time, date: fullDate });
        url.save();

        if (url.redirUrl.includes('http')) {
            res.redirect(url.redirUrl);
        }
        else {
            res.redirect('https://' + url.redirUrl);
        }
    } catch (err) {
        res.send(err.message);
    }

}

async function handleShowTrackPage(req, res) {
    try {
        let token = req.cookies.token;
        if (token) {
            let data = jwt.verify(token, JWT_SECRET);
            let user = await userModel.findOne({ email: data.email });
            res.render('track', { user });
        }
        else {

            res.render('track', { user: null });
        }
    } catch (err) {
        res.send(err.message);
    }
}

async function handleTrackingDetails(req, res) {
    try {
        let user = await isLoggedIn(req.cookies.token);
        let surl = req.body.url;
        surl = surl.split('/').filter(function (ele) {
            return ele != '';
        });
        let sid = surl[surl.length - 1];
        let url = await urlModel.findOne({ shortId: sid });
        if (!url) {
            return res.render('trackingDetails', { str: 'Invalid Short URL', found: false, user });
        }

        res.render('trackingDetails', { visited: url.visited, details: url.details, found: true, user });
    } catch (err) {
        res.send(err.message);
    }
}

async function handleAboutPage(req, res) {
    try {
        let user = await isLoggedIn(req.cookies.token);
        res.render('about', { user });
    } catch (err) {
        res.send(err.message);
    }
}

async function handleHomePage(req, res) {
    try {
        let user = await isLoggedIn(req.cookies.token);
        res.render('index', { user });
    } catch (err) {
        res.send(err.message);
    }

}

async function isLoggedIn(token) {
    if (token) {
        let data = jwt.verify(token, JWT_SECRET);
        let user = await userModel.findOne({ email: data.email });
        return user;
    }
    else {
        return user = null;
    }
}

async function handleProfilePage(req, res) {
    try {
        let data = jwt.verify(req.cookies.token, JWT_SECRET);
        let user = await userModel.findOne({ email: data.email })
        res.render('profile', { user })
    } catch (err) {
        res.send(err.message);
    }
}

async function handleResendLink(req, res) {
    try {
        let data = jwt.verify(req.params.token, JWT_SECRET);

        let user = await userModel.findOne({ email: data.email });
        let token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '10m' });
        await sendEmail('signup-verification', { email: user.email, name: user.name, token });
        res.render('verify-account');
    } catch (err) {
        res.send(err.message);
    }

}

function handleForgotPasswordPage(req, res) {
    res.render('forgot-password', { warning: false });
}

async function handleForgotPassword(req, res) {

    try {
        let user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            return res.render('forgot-password', { warning: true });
        }
        let token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '10m' });
        await sendEmail('reset-password', { email: user.email, name: user.name, token });
        res.render('reset-link-sent');
    } catch (err) {
        res.send(err.message);
    }


}

function handleResetPasswordPage(req, res) {
    try {
        let token = req.params.token;
        let data = jwt.verify(token, JWT_SECRET);
        res.render('reset-password', { token });
    } catch (err) {
        if(err.name==='TokenExpiredError'){
           return res.send('Link Expired!');
        }
        res.send(err.message);
    }

}

async function handleResetPassword(req, res) {
    try {
        let data = jwt.verify(req.params.token, JWT_SECRET);
        let np = req.body.password;
        let cnp = req.body.confirmPassword;
        if (np != cnp) {
            return res.send('Passwords do not match');
        }
        let salt = await bcrypt.genSalt();
        let hpw = await bcrypt.hash(np, salt);
        await userModel.findOneAndUpdate({ email: data.email }, { password: hpw }, { new: true });

        res.redirect('/login');

    } catch (err) {
        res.send(err.message);
    }
}

async function handleEditProfile(req, res) {
    try {
        let data = jwt.verify(req.cookies.token, JWT_SECRET);
        let user = await userModel.findOne({ email: data.email });
        res.render('edit-profile', { user });
    } catch (err) {
        res.send(err.message);
    }
}

async function handleSaveProfileDetails(req, res) {
    try {
        let data = jwt.verify(req.cookies.token, JWT_SECRET);
        let { name, age } = req.body;
        await userModel.findOneAndUpdate({ email: data.email }, { name, age });
        res.redirect(`/profile`);
    } catch (err) {
        res.send(err.message);
    }
}




module.exports = {
    handleLoginPage,
    handleRegisterPage,
    handleRegister,
    handleAccountVerification,
    handleLogin,
    handleGenerateShortURL,
    handleLogOut,
    handleRedirectShortUrl,
    handleShowTrackPage,
    handleTrackingDetails,
    handleAboutPage,
    handleHomePage,
    handleProfilePage,
    handleResendLink,
    handleForgotPasswordPage,
    handleForgotPassword,
    handleResetPasswordPage,
    handleResetPassword,
    handleEditProfile,
    handleSaveProfileDetails
}
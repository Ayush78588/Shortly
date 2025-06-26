let nodemailer = require('nodemailer');

let shortlyDomain = process.env.SHORTLY_DOMAIN;

async function sendMail(event, data) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.PASSWORD
        }
    });

    let subject, html;
    if (event === 'signup-verification') {
        subject = `Verify Your Account ${data.name}`;
            html = `Welcome to Shortly, ${data.name}! <br> <a href="${shortlyDomain}/verifyemail/${data.token}">Click here to verify</a>`
    }else if(event === 'reset-password'){
        subject = 'Reset your password';
        html = `Welcome to Shortly, ${data.name}! <br> <a href="${shortlyDomain}/reset-password/${data.token}">Click here</a> to reset your password.`
    }

    let obj = {
        from: process.env.EMAIL_ID,
        to: data.email,
        subject,
        html
    }
    try {
        let info = await transporter.sendMail(obj);
        console.log(info.response);
        return 'sent';

    }
    catch (err) {
        return 'error';
    }

}
module.exports = sendMail; 
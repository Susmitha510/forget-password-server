const { $gt } = require("sift");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

// Setup email (Gmail SMTP)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.register = async (req, res) => {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
        email,
        password: hashed
    });

    res.send('User registered');
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.send('If user exists, password reset email sent');
    }

    const token = crypto.randomBytes(20).toString('hex');

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    const message = `Click to reset password: ${resetLink}`;

    await transporter.sendMail({
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: 'Password Reset',
        text: message
    });

    res.send('If user exists, password reset email sent');
};
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).send("Invalid or expired token");
    }

    const hashed = await bcrypt.hash(password, 10);

    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpiry = null;

    await user.save();

    res.send("Password reset successful");
};

// Login User
exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    //FInd the user by email
    if (!user) {
        return res.status(400).send("User does not exist");
    }
    
    //Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).send("Invalid password");
    }

    //You can optically generate ans send a JWT token or set a session here (not covered in this basic version)
    res.send("Login successful");
};
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

// Register User
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Create user
        await User.create({
            email: email.toLowerCase(),
            password: hashed
        });

        res.status(201).send("User registered successfully");
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).send("Registration failed");
    }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.send(
                "If user exists, password reset email sent"
            );
        }

        const token = crypto.randomBytes(20).toString("hex");

        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour

        await user.save();

        const resetLink =
            `http://localhost:5173/reset-password/${token}`;

        await transporter.sendMail({
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: "Password Reset",
            text: `Click to reset password: ${resetLink}`
        });

        res.send("If user exists, password reset email sent");
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).send("Something went wrong");
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send(
                "Invalid or expired token"
            );
        }

        const hashed = await bcrypt.hash(password, 10);

        user.password = hashed;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();

        res.send("Password reset successful");
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).send("Something went wrong");
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(400).send("User does not exist");
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).send("Invalid password");
        }

        res.send("Login successful");
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send("Something went wrong");
    }
};
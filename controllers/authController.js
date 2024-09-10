const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const redisClient = require('../utils/redisClient');
const { sendOTP } = require('../utils/smsService');

// Register a new user
exports.register = async (req, res) => {
    const { mobile, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ mobile, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'ثبت نام موفقیت آمیز بود' });
};

// Login a user (Send OTP)
exports.login = async (req, res) => {
    const { mobile } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: 'کاربری با این شماره یافت نشد' });

    try {
        await sendOTP(mobile);
        res.status(200).json({ message: 'کد تایید ارسال شد' });
    } catch (err) {
        res.status(429).json({ message: err.message });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    const { mobile, code } = req.body;
    const storedCode = await redisClient.get(`otp:${mobile}`);

    if (storedCode === code) {
        // OTP is correct
        await redisClient.del(`otp:${mobile}`); // Delete the OTP
        res.status(200).json({ message: 'ورود موفقیت آمیز بود' });
    } else {
        res.status(400).json({ message: 'کد تایید نامعتبر است' });
    }
};
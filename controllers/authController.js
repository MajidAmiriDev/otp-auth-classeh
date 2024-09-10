const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const redisClient = require('../utils/redisClient');
const { sendOTP } = require('../utils/smsService');
const jwt = require('jsonwebtoken');



const generateToken = (user) => {
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
    return { accessToken, refreshToken };
};


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
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: 'کاربری با این شماره یافت نشد' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'رمز عبور نادرست است' });

    const tokens = generateToken(user);
    res.status(200).json({ ...tokens, message: 'ورود موفقیت آمیز بود' });
};

// Verify OTP
exports.verifyToken = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) return res.status(401).json({ message: 'توکن معتبر نیست' });

    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'توکن معتبر نیست' });
        req.user = decoded;
        next();
    });
};

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'رفرش توکن ارائه نشده است' });

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'رفرش توکن معتبر نیست' });

        const tokens = generateToken({ _id: decoded.id });
        res.status(200).json(tokens);
    });
};
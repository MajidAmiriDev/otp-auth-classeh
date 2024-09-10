const kaveneghar = require('../config/kaveneghar');
const redisClient = require('./redisClient');

const sendOTP = async (mobile) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if there's a code sent within the last 2 minutes
    const existingCode = await redisClient.get(`otp:${mobile}`);
    if (existingCode) {
        throw new Error('کد قبلاً ارسال شده است، لطفاً دو دقیقه صبر کنید.');
    }

    // Save OTP to Redis with 2-minute retry limit and 10-minute expiration
    await redisClient.set(`otp:${mobile}`, code, { EX: 600, NX: true });

    // Send the OTP via SMS
    await kaveneghar.sendSMS(mobile, `Your verification code is: ${code}`);

    return code;
};

module.exports = { sendOTP };
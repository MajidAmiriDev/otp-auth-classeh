module.exports = {
    apiKey: process.env.KAVEHNEGAR_API_KEY,
    sendSMS: async function (receptor, message) {
        // استفاده از کتابخانه مناسب برای ارسال پیامک
        const axios = require('axios');
        try {
            const response = await axios.post('https://api.kavenegar.com/v1/' + this.apiKey + '/sms/send.json', {
                receptor: receptor,
                message: message,
            });
            return response.data;
        } catch (error) {
            throw new Error('SMS sending failed');
        }
    }
};
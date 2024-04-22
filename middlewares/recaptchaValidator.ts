import axios from 'axios';
import { Request, Response, NextFunction } from 'express';

async function recaptchaValidator(req: Request, res: Response, next: NextFunction) {
    const captcha_token = req.body.captcha_token;

    if (!captcha_token) {
        return res.json({ status: 'error', message: 'No reCAPTCHA token provided' });
    }

    const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY; // 你的 reCAPTCHA 私钥
    const recaptchaVerificationUrl = `https://www.recaptcha.net/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${captcha_token}`;

    try {
        const recaptchaResponse = await axios.post(recaptchaVerificationUrl, {
            secret: recaptchaSecretKey,
            response: captcha_token
        });

        if (!recaptchaResponse.data.success) {
            return res.json({ status: 'error', message: 'reCAPTCHA verification failed' });
        }
        if (recaptchaResponse.data.score < 0.7) {
            return res.json({ status: 'error', message: 'reCAPTCHA verification failed' });
        }
        next();
    } catch (error) {
       return res.json({ status: 'error', message: 'reCAPTCHA verification failed', error });
    }
}

export default recaptchaValidator;
import express, { Request, Response } from 'express';
import User from "../models/userModel";
import session, { SessionData } from 'express-session';
import axios from "axios";
import recaptchaValidator from "../middlewares/recaptchaValidator";
import {Op} from "sequelize";

declare module 'express-session' {

    export interface SessionData {

        user: Partial<User> & {
            isLoggedIn?: boolean
        }; // Use your User models here
    }
}

const router = express.Router();


router.post('/info', async (req: Request, res: Response) => {
    if (req.session.user) {
        const user = await User.findByPk(req.session.user.id);
        if (user) {
            res.json(user);
        } else {
            res.json({ status: 'error', message: 'User not found' });
        }
    } else {
        res.json({ status: 'error', message: 'Not logged in' });
    }
});

router.post('/login', recaptchaValidator,async (req: Request, res: Response) => {
    const { username, password } = req.body;

    // // 验证 reCAPTCHA
    // const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY; // 你的 reCAPTCHA 私钥
    // const recaptchaVerificationUrl = `https://www.recaptcha.net/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${captcha_token}`;
    //
    // const recaptchaResponse = await axios.post(recaptchaVerificationUrl, {
    //     secret: recaptchaSecretKey,
    //     response: captcha_token
    // });
    // if (!recaptchaResponse.data.success) {
    //     return res.json({ status: 'error', message: 'reCAPTCHA verification failed' });
    // }

    const user = await User.findOne({ where: { username } });
    if (user && user.password === password) {
        req.session.user = user; // 设置 session

        req.session.save();

        res.json({ status: 'success', message: 'Login successful',token:req.session.id});
    } else {
        res.json({ status: 'error', message: 'Invalid username or password' });
    }
});

router.post('/register', recaptchaValidator, async (req: Request, res: Response) => {
    const { username, password, email } = req.body;

    // 检查用户名或电子邮件是否已经被注册
    const existingUser = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
    if (existingUser) {
        return res.json({ status: 'error', message: 'Username or email already registered' });
    }

    try {
        const user = await User.create({ username, password, email });
        res.json({ status: 'success', message: 'Registration successful', user });
    } catch (error) {
        res.json({ status: 'error', message: 'Registration failed', error });
    }
});

router.post('/logout', (req: Request, res: Response) => {
    if (req.session.user) {
        delete req.session.user;
        res.json({ status: 'success', message: 'Logout successful' });
    } else {
        res.json({ status: 'error', message: 'Not logged in' });
    }
});

export default router;
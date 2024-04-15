import express from 'express';

// 创建一个中间件来检查用户是否已经登录
function isLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.session && req.session.user) {
        next();
    } else {
        return  res.json({ status: 'error', message: 'You must be logged in to access this resource.' });
    }
}
export default isLogin;
import multer from "multer";
import express from "express";
import Image from "../models/imageModel";
import upload from "../utils/multerTool";
import isLogin from "../middlewares/authenticator";

const router = express.Router();




router.post('/list', async function (req, res, next) {
    const pageSize = Number(req.query.pageSize||10);
    const pageIndex = Number(req.query.pageIndex||1);
    if (!pageSize || !pageIndex) {
        return res.json({ status: 'error', message: 'Missing pageSize or pageIndex query parameters.' });
    }
    try {
        const images = await Image.findAll({
            limit: pageSize,
            offset: (pageIndex - 1) * pageSize
        });
        if (images.length === 0) {
            return res.json({ status: 'error', message: 'No images found.' });
        }
        res.json(images);
    } catch (err) {
        next(err);
    }
});
router.post('/upload', isLogin, upload.single('file'), function (req, res, next) {
    // req.file 是 'picture' 文件
    // req.body 将具有文本域数据，如果存在的话
    if (!req.file) {
        res.json({ status: 'error', message: 'No files were uploaded.' });
    }
    if(!req.session.user.id)
    {
        return res.json({ status: 'error', message: 'You must be logged in to access this resource.' });
    }
    // 在这里，你可以添加处理上传文件的代码，例如保存文件到数据库，或者进行其他处理
    try {
        const image = Image.create({
            user_id: req.session.user.id,
            detect: false,
            image_path: req.file.path
        });

        res.json({ status: 'success', message: 'File uploaded successfully', image });
    } catch (err) {
        next(err);
    }
});

export default router;
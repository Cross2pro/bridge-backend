import fs from 'fs';

import express from "express";
import Image from "../models/imageModel";
import upload from "../utils/multerTool";
import isLogin from "../middlewares/authenticator";
import path from "path";
import axios from "axios";
import decodeMask from "../utils/decodeMask";
import sizeOf, {imageSize} from "image-size";
import imageModel from "../models/imageModel";
import {Op} from "sequelize";
const router = express.Router();

/**
 * 使用 AK，SK 生成鉴权签名（Access Token）
 * @return string 鉴权签名信息（Access Token）
 */
let cachedAccessToken = null;

async function getAccessToken() {
    if (cachedAccessToken) {
        return cachedAccessToken;
    }

    let options = {
        'method': 'POST',
        'url': 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + process.env.AK + '&client_secret=' + process.env.SK,
    }

    try {
        const response = await axios.post(options.url);
        cachedAccessToken = response.data.access_token;
        return cachedAccessToken;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

router.get('/mask/:imageId', async function (req, res, next) {
    const imageId = req.params.imageId;
    if (!imageId) {
        return res.json({ status: 'error', message: 'Missing imageId parameter.' });
    }

    const image = await Image.findOne({ where: { id: imageId }, attributes: ['mask']});
    if (!image) {
        return res.json({ status: 'error', message: 'Image not found.' });
    }
    res.json({ status: 'success', mask: image.mask });
});

router.get('/info/recent', async (req, res, next) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentUploadsCount = await Image.count({
            where: {
                createdAt: {
                    [Op.gte]: sevenDaysAgo
                }
            }as any
        });

        const totalUploadsCount = await Image.count();

        res.json({
            status: 'success',
            data: {
                recentUploadsCount,
                totalUploadsCount
            }
        });
    } catch (err) {
        next(err);
    }
});
router.post('/list', async function (req, res, next) {
    const pageSize = Number(req.query.pageSize||10);
    const pageIndex = Number(req.query.pageIndex||1);
    if (!pageSize || !pageIndex) {
        return res.json({ status: 'error', message: 'Missing pageSize or pageIndex query parameters.' });
    }
    try {
        const images = await Image.findAll({
            limit: pageSize,
            offset: (pageIndex - 1) * pageSize,
            attributes: ['id', 'image_path', 'createdAt', 'detect','user_id'],
        });
        if (images.length === 0) {
            return res.json({ status: 'error', message: 'No images found.' });
        }
        res.json(images);
    } catch (err) {
        next(err);
    }
});
router.post('/upload', isLogin, upload.single('file'),async function (req, res, next) {
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
        const image = await Image.create({
            user_id: req.session.user.id,
            detect: false,
            image_path: req.file.path
        });

        res.json({ status: 'success', message: 'File uploaded successfully', image });
    } catch (err) {
        next(err);
    }
});
router.post('/process', isLogin, async function (req, res, next) {
    const imageId = req.body.imageId;
    if (!imageId) {
        return res.json({ status: 'error', message: 'Missing imageId parameter.' });
    }

    // 从数据库中获取图像
    const image = await Image.findOne({ where: { id: imageId } });
    if (!image) {
        return res.json({ status: 'error', message: 'Image not found.' });
    }

    // 读取文件并转换为Base64编码
    const filePath = image.image_path;
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString('base64');

    const dimensions = imageSize(filePath);
    const height = dimensions.height;

    const data = {
        image: base64Image, // API需要支持Base64编码的图像数据
    };

    try {
        const url = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/segmentation/BridgeSegTestV1';
        const accessToken = await getAccessToken();
        const fullUrl = `${url}?access_token=${accessToken}`;

        const response = await axios.post(fullUrl, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.data && response.data.results) {
            response.data.results.forEach( item => {
                item.mask = decodeMask(item.mask, height);
            });
            await Image.update({ mask: response.data.results,detect:true }, { where: { id: imageId } });

            res.json({ status: 'success', message: 'EasyDL processing and database update successful.' });

        } else {
            res.json({ status: 'error', message: 'EasyDL processing failed.' });
        }
    } catch (error) {
        console.error('Error requesting EasyDL service:', error);
        res.json({ status: 'error', message: 'Internal server error.' });
    }
});
router.delete('/delete/:filePath', async function (req, res, next) {
    let filePath = req.params.filePath;
    if (!filePath) {
        return res.json({ status: 'error', message: 'Missing file path parameter.' });
    }
    // 检查 filePath 是否以 'uploads/' 开头
    if (!filePath.startsWith('uploads/')) {
        return res.json({ status: 'error', message: 'Invalid file path.' });
    }
    try {
        // 使用 path.basename 来防止路径遍历攻击
        filePath = path.join(__dirname, '..', path.basename(filePath));

        // 删除文件
        fs.unlinkSync(filePath);

        // 删除数据库中的记录
        const result = await Image.destroy({
            where: {
                image_path: filePath
            }
        });

        if (result === 0) {
            return res.json({ status: 'error', message: 'No record found in the database.' });
        }

        res.json({ status: 'success', message: 'File and database record deleted successfully' });
    } catch (err) {
        next(err);
    }
});
export default router;
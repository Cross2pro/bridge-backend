import path from 'path';
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname.substring(0,file.originalname.indexOf(".")) + '-' + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage });

export default upload;
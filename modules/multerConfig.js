const fs = require('fs');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        let dir;
        if (file.fieldname === 'logo' || file.fieldname === 'boxes' || file.fieldname === 'banner') {
            dir = path.join(__dirname, '../uploads/images');
        } else if (file.fieldname === 'docFiles') {
            dir = path.join(__dirname, '../uploads/docs');
        }
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb){
        if (file.fieldname === 'logo' || file.fieldname === 'boxes' || file.fieldname === 'banner'){
            cb(null, file.fieldname+Math.round(Date.now()/1000)+path.extname(file.originalname))
        } else if (file.fieldname === 'docFiles'){
            cb(null,file.originalname)
        }
    }
})

const upload = multer({ storage: storage })

const multiUpload = upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'boxes', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'docFiles', maxCount: 5 },
])

module.exports = multiUpload
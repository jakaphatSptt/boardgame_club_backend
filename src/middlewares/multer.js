const multer = require('multer');
const path = require('path');

const upload = multer({ storage: multer.memoryStorage() });

const multiUpload = upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'boxes', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'docFiles', maxCount: 10 },
]);

module.exports = { upload, multiUpload }
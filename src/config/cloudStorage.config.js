const path = require('path');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
    projectId: process.env.GCS_ID,
    keyFilename: path.join(__dirname, process.env.GCS_KEY_PATH)
});

exports.bucket = storage.bucket(process.env.GCS_BUCKET);

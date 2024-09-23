const multer = require('multer');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { resolve } = require('path');
const { rejects } = require('assert');

const upload = multer({ storage: multer.memoryStorage() });
const multiUpload = upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'boxes', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'docFiles', maxCount: 10 },
]);

const storage = new Storage({
    projectId: `festive-zoo-434208-m4`,
    keyFilename: path.join(__dirname,'./festive-zoo-434208-m4-6596cb2e73f8.json')
});
const bucket = storage.bucket('fbgc_uploads');

const uploadsToGCS =(file, folder) =>{
    return new Promise((resolve, rejects)=>{
        if(!file){
            resolve(null);
            return;
        }
        const blob = bucket.file(`${folder}/${file.fieldname}_${Date.now()}_${file.originalname}`);

        const blobStream = blob.createWriteStream();

        blobStream.on(`error`,(error)=> rejects(error));
        blobStream.on(`finish`, async()=>{
            await blob.makePublic();
            const publicUrl = `http://storage.googleapis.com/${bucket.name}/${blob.name}`;
            resolve(publicUrl);
        });
        blobStream.end(file.buffer);
    });
};

const delFromGCS = async(file, folder)=>{
    if(!file) return
    const set = `${folder}/${file}`;
    try {
        await bucket.file(set).delete();
        console.log(`File ${file} deleted`);
        return { success: true, message: `File ${file} deleted`};
    } catch (error) {
        console.error(`Failed to delete file ${file}:`, error.message);
        return { success: false, message: `Failed to delete file ${file}: ${error.message}`}
    }
}

module.exports = { upload, multiUpload, uploadsToGCS, delFromGCS }
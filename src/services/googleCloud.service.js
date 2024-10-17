const path = require('path');
const { resolve } = require('path');
const { rejects } = require('assert');
const { bucket } = require('../config/cloudStorage.config')

exports.cloudUpload =(file, folder) =>{
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
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            resolve(publicUrl);
        });
        blobStream.end(file.buffer);
    });
};

exports.cloudDelete = async(file, folder)=>{
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
};
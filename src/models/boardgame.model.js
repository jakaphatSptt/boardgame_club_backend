const mongoose = require('../config/mongodb.config');

const boardGameSchema = new mongoose.Schema({
    gid: { type: String , required: true, unique: true },
    title: { type: String , required: true },
    community: { type: String },
    playingTime: { type: String },
    tags: [{ tag:String }],
    price: { type: Number},
    content: { type: String },
    logo: { type: String },
    boxes: { type: String },
    banner: { type: String },
    videoLink: { type: String },
    docFiles: [{ doc: String }],
});

const bgData = mongoose.model('game', boardGameSchema);

module.exports = bgData;
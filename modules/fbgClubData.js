const mongoose = require('mongoose');

//เชื่อมกับ mongoDB
const dbURL = 'mongodb+srv://gcg000sptt:Occasion2540@projectfbg.cnrgo.mongodb.net/fbgClub'

mongoose.connect(dbURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).catch(err=>console.log(err))

//ออกแบบ
let customerSchema = new mongoose.Schema({
    cid:String,
    date:Date,
    dateB:Number,
    startMDY:String,
    startTime:String,

});
let gameSchema = new mongoose.Schema({
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
let priceSchema = new mongoose.Schema({
    hrs1:String,
    hrs2:String,
    hrs3:String,
    hrs4:String,
    hrs5:String,
})

let adminSchema = new mongoose.Schema({
    username: String,
    password: String
})

//สร้าง model
let ctData = mongoose.model("customer",customerSchema);
let bgData = mongoose.model("game",gameSchema);
let pData = mongoose.model("price",priceSchema);
let adminData = mongoose.model("admin",adminSchema);

// ส่งออก model
module.exports = { ctData, bgData, pData, adminData }

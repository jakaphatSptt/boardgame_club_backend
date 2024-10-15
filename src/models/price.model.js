const mongoose = require('../config/mongodb.config');

const priceSchema = new mongoose.Schema({
    hrs1:String,
    hrs2:String,
    hrs3:String,
    hrs4:String,
    hrs5:String,
});

const pData = mongoose.model("price", priceSchema);

module.exports = pData;
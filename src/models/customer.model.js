const mongoose = require('../config/mongodb.config');

const customerSchema = new mongoose.Schema({
    cid:String,
    date:Date,
    dateB:Number,
    startMDY:String,
    startTime:String,
});

const cData = mongoose.model('customer', customerSchema);

module.exports = cData;
const mongoose = require('mongoose');

const dbURL = process.env.DB_LOCALHOST;
//const dbURL = process.env.DB_ATLAS;

mongoose.connect(dbURL).catch(err=>console.log(err));

module.exports = mongoose;
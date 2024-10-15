const mongoose = require('../config/mongodb.config');

const adminSchema = new mongoose.Schema({
    username: String,
    password: String
});

const adminData = mongoose.model("admin",adminSchema);

module.exports = adminData;
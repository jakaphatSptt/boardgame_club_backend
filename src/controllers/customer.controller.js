const cData = require('../models/customer.model');

exports.getCustomers = async(req, res) => {
    try {
        const customers = await cData.find({});
        res.status(200).json({ message:'get customers database succuss', customers })
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
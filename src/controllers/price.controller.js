const pData = require('../models/price.model')

exports.present = async(req, res) => {
    try {
        const price = await pData.find({});
        if(price === null){
            return res.status(404).json({ message:'price not found' });
        };
        res.status(200).json({ message:'price hare', price});
        console.log(price)
    } catch (error) {
        res.status(500).json({message: error.message});
        console.log('error', error);
    }
};

exports.update = async(req, res) => {
    try {
        const id = '66bba6ef85f2c67ba7fb46f8'
        const updatePrice = {
            hrs1: req.body.hrs1,
            hrs2: req.body.hrs2,
            hrs3: req.body.hrs3,
            hrs4: req.body.hrs4,
            hrs5: req.body.hrs5
        };
        const result = await pData.findOneAndUpdate(id, updatePrice, {new: true, upsert:true});
        res.status(201).json({ message:'updated', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log('error' ,error);
    };
};
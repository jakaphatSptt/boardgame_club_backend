const express = require('express');
const router = express.Router();

const { getPrice, updatePrice } = require('../controllers/price.controller');

router.get('/price', getPrice);
router.get('/update/price', updatePrice);

module.exports = router;
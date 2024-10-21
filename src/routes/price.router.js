const express = require('express');
const router = express.Router();

const price = require('../controllers/price.controller');

router.get('/price', price.present);
router.get('/update/price', price.update);

module.exports = router;
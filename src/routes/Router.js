const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { getCustomers } = require('../controllers/customer.controller')
const { getBoardGames } = require('../controllers/boardgame.controller')

router.get('/', (req, res) => {
    res.send('hello')
});

router.get('/customers', getCustomers);
router.get('/games', getBoardGames);

module.exports = router;
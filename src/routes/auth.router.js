const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = require('../controllers/auth.controller');

router.post('/login', authController);
router.post('/register', authController);

module.exports = router;
const express = require('express');
const router = express.Router();

const customerController = require('../controllers/customer.controller')

router.get('/', (req, res) => {
    res.send('hello')
});

router.get('/customers', customerController.list);
router.get('/customer/:id', customerController.personal);
router.post('/customer/create', customerController.create);
router.put('/customer/start/:id', customerController.start);
router.put('/customer/stop/:id', customerController.clear);
router.delete('/customer/delete/:id', customerController.delete);
router.delete('/customer/deletelastid', customerController.deleteLastId);

module.exports = router;
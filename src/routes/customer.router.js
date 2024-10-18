const express = require('express');
const router = express.Router();

const { getCustomers, getCustomer, createCustomer, getDate, clearDate, deleteCustomer, deleteLastCustomer } = require('../controllers/customer.controller')

router.get('/', (req, res) => {
    res.send('hello')
});

router.get('/customers', getCustomers);
router.get('/customer/:id', getCustomer);
router.post('/customer/create', createCustomer);
router.put('/customer/getdate/:id', getDate);
router.put('/customer/cleardate/:id', clearDate);
router.delete('/customer/delete/:id', deleteCustomer);
router.delete('/customer/deletelastid', deleteLastCustomer);

module.exports = router;
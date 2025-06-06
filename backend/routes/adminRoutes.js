const express = require('express');
const { getStats, getAllOrders, 
    getOrderByGUID, setCommissions, 
    approveOrder, getInvoices, getInvoiceById, 
    resolveInvoice, getPendingOrders, hideProduct
    } = require('../controllers/AdminController');

const router = express.Router();

router.get('/stats', getStats);
router.get('/orders/all', getAllOrders);
router.get('/orderByGuid/:id', getOrderByGUID);
router.post('/commissions', setCommissions);
router.post('/approveOrder', approveOrder);
router.get('/invoice/all', getInvoices);
router.get('/invoiceDataById/:id', getInvoiceById);
router.post('/resolveInvoice', resolveInvoice);
router.get('/pending-orders', getPendingOrders);
router.get('/hideProduct/:id', hideProduct);

module.exports = router;

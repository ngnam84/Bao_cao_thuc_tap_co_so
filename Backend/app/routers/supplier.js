const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// Định tuyến cho tìm kiếm nhà cung cấp
router.get('/search', supplierController.searchSuppliers);

// Định tuyến cho các hoạt động CRUD trên nhà cung cấp
router.get('/', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.post('/', supplierController.createSupplier);
router.put('/:id', supplierController.updateSupplierById);
router.delete('/:id', supplierController.deleteSupplierById);

module.exports = router;

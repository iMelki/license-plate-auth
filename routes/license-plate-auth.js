const express = require('express');
const router = express.Router();

// Require controller modules.
const licensePlateAuthController = require('../controllers/licensePlateAuthController');

router.post('/', licensePlateAuthController.check_license_plate);

module.exports = router;

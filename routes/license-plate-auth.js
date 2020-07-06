const express = require('express');
//const debug = require('debug')('server');
const router = express.Router();

// Require controller modules.
const licensePlateAuthController = require('../controllers/licensePlateAuthController');

// GET catalog home page.
router.get('/', licensePlateAuthController.check_license_plate_httpGet);

router.post('/', licensePlateAuthController.check_license_plate);

module.exports = router;

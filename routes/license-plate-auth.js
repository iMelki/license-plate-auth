const express = require('express');
const debug = require('debug')('server');
const router = express.Router();

// Require controller modules.
const licensePlateAuthController = require('../controllers/licensePlateAuthController');

// GET catalog home page.
router.get('/', licensePlateAuthController.check_license_plate_httpGet);

router.post('/', licensePlateAuthController.check_license_plate);


/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// /* You're so cool. */
// router.get('/cool/', function(req, res, next) {
//   res.send('You\'re so cool');
// });

module.exports = router;

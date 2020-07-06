const express = require('express');
//const debug = require('debug')('server').extend('index');
const router = express.Router();

const dbService = require('../services/db-service');

// GET home page.
router.get('/', function(req, res) {
  res.send(dbService.getAllRecords());
  //res.redirect('/license-plate-auth');
});

module.exports = router;

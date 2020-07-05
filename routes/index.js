const express = require('express');
const debug = require('debug')('server').extend('index');
const router = express.Router();

// GET home page.
router.get('/', function(req, res) {
  debug("index");
  res.send('Hi from index router!');
  res.redirect('/license-plate-auth');
});

module.exports = router;

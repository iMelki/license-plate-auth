const express = require('express');
const router = express.Router();

const dbService = require('../services/db-service');

// GET home page.
router.get('/', async function(req, res) {
  const allRecords = await dbService.getAllRecords();
  res.json(allRecords);
});

module.exports = router;

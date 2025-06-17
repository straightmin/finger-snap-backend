const express = require('express');
const router  = express.Router();
const authCtrl = require('../controllers/auth.controller');

router.get('/ping', authCtrl.ping);

module.exports = router;
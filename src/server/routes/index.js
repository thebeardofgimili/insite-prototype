const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');
const path = require('path');


//Dashboard, the ensureAuthenticated is just added to any get request to protect the page
router.get('/dashboard', ensureAuthenticated,  (req, res) => 
res.render('dashboard', {
    name: req.user.name
}));

module.exports = router;
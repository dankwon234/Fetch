var express = require('express');
var router = express.Router();

router.post('/:resource', function(req, res, next) {

    username = req.body.username;
    full_name = req.body.full_name;
    avatar_url = req.body.avatar_url;
    update_account(username, full_name, avatar_url); // TODO: create this function
    // TODO: Return something useful or redirect

    res.json({
    	username: username,
    	full_name: full_name,
    	avatar_url: avatar_url
    });

});


module.exports = router;

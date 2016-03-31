var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');


var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;


router.get('/:resource', function(req, res, next) {

    if (req.params.resource == 'sign_s3'){
        aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
        var s3 = new aws.S3();
        var s3_params = {
            Bucket: S3_BUCKET,
            Key: req.query.file_name,
            Expires: 60,
            ContentType: req.query.file_type,
            ACL: 'public-read'
        };
        s3.getSignedUrl('putObject', s3_params, function(err, data){
            if(err){
                console.log(err);
            }
            else{
                var return_data = {
                    signed_request: data,
                    url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name
                };
                res.write(JSON.stringify(return_data));
                res.end();
            }
        });
    }

});


router.post('/:resource', function(req, res, next) {

    var username = req.body.username;
    var full_name = req.body.full_name;
    var avatar_url = req.body.avatar_url;
//    update_account(username, full_name, avatar_url); // TODO: create this function
    // TODO: Return something useful or redirect

    res.json({
    	username: username,
    	full_name: full_name,
    	avatar_url: avatar_url
    });

});


module.exports = router;

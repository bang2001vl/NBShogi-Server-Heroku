var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var {checkLogin:checker, authToken:authToken2} = require('../Controller/authController');

router.use(express.urlencoded({extended:true})); 
router.use(express.json());
router.use(cookieParser());

const authToken = (req, res, next) =>{
    //console.log('Cookies: ' + JSON.stringify(req.cookies));
    var token = req.body.token;
    if(token != null)
    {
        console.log('Have access with token = ' + token);
        authToken2(token, (err, decoded)=>{
            if(!err){
                if(decoded.userName === req.body.userName)
                {
                    req.userID = decoded.id;
                    req.username = decoded.username;
                    return next();
                }
                
            }
            return res.sendStatus(403);
        });
    }
    else{
        return res.sendStatus(401);
    }
}
// Login
router.post('/login', function (req, res) {
    const data = req.body;
    console.log(JSON.stringify(req.body));
    console.log("POST: /api/login with user = " + data.username + " , pass = " + data.password);
    checker(req, res, data);
});

router.get('/test', authToken, function (req, res) {
    res.send('About user with id = ' + req.userID).end();
});

module.exports = {
    router
}
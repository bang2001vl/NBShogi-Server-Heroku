const jwt = require('jsonwebtoken');
const jwtOptions = {
    //algorithm: 'RS256'
}

const checkLogin = async function (req, res, data){
    let usn = data.username;
    let pass = data.password;
    // Get connection
    var client = await req.app.get('db')();
    // Query data
    const collection = client.db('testDB').collection('authenInfo');
    const query = { username: usn, password: pass };
    const options = {
        projection: { _id: 1, username:1},
    };
    var user = await collection.findOne(query, options);
    // Check data
    if(user != null){
        console.log('Authorized user : id = ' + user._id);
        res.statusCode = 200;
        var token = jwt.sign({userID : user._id, username:user.username}, process.env.SECRET, jwtOptions);
        console.log('Generated Token = ' + token);
        res.json({result: "OK", auth_token: token});
        res.end();
    }
    else{
        console.log("Auth-result = false");
        res.sendStatus(401);
    }  
};

var authToken = function (token, callback){
    jwt.verify(token, process.env.SECRET, jwtOptions, (err, decoded)=>{
        if(err){
            callback(err);
        }
        // Some additional check
        callback(err, decoded);
    })
}

module.exports = {
    checkLogin,
    jwtOptions,
    jwt, 
    authToken,
}
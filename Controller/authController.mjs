const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://nbshogi:gHeQ55kmdasV3Hbn@clusterfirst.cd2od.mongodb.net/testDB?retryWrites=true&w=majority&sslAllowInvalidCertificates=true";
const jwt = require('jsonwebtoken');
const jwtOptions = {
    //algorithm: 'RS256'
}

let cookieOptions = {
    httpOnly: true, // The cookie only accessible by the web server
    //signed: true // Indicates if the cookie should be signed
}

const checkLogin = async function (req, res, data){
    var rs = false;
    let usn = data.username;
    let pass = data.password;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try{
        await client.connect();
        //console.log('Connected to db');

        const collection = client.db('testDB').collection('authenInfo');
        const query = { username: usn, password: pass };
        const options = {
            sort: { rating: -1 },
            projection: { _id: 1, username:0, password: 0},
        };
        var user = await collection.findOne(query, options);

        if(user != null){
            console.log('Authorized user : id = ' + user._id);
            res.statusCode = 200;
            var token = jwt.sign({id : user._id}, "my-super-secret-key", jwtOptions);
            console.log('Generated Token = ' + token);
            res.cookie('token', token, cookieOptions);
            res.json({result: "OK"}).end();
        }
        else{
            console.log("Auth-result = false");
            res.statusCode = 401;
            res.json({result: "FAILED"}).end();
        }
    }
    catch(err){
        console.log('ERROR with database');
        console.error(err);
    }
    finally{
        if(client.isConnected){client.close();}
    }    
};



export {checkLogin, jwtOptions};
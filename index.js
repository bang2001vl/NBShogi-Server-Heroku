require('dotenv').config();
const express = require('express');
const express_session = require('express-session');
const sharedsession = require("express-socket.io-session");
const http = require('http');

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://nbshogi:gHeQ55kmdasV3Hbn@clusterfirst.cd2od.mongodb.net/myFirstDatabase?retryWrites=true&w=majority&sslAllowInvalidCertificates=true";
var client;

const initDB = async (callback)=>{
    try{
        client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('PASSED: Established connection to database');
        if(callback)callback();
    }
    catch(err){
        console.log('FAILED: Connot connect to database');
        console.log(err);
        if(callback)callback(err)
    }
}

const {router : apiRouter} = require('./Routes/api');

const app = express();
let port = process.env.PORT || 8000;
const server = http.createServer(app);
const io = require('socket.io')(server);
const {authToken} = require('./Controller/authController');
const {sessionSocketMDW, tokenSocketMDW} = require('./middlewares/socket_middleware');
const console = require('console');
const mainNSP = io.of('/authorized');

const eSession = express_session({
    secret: "my-secret",
    resave: false,
    saveUninitialized: false,
    autoSave:false,
    unset:'destroy',
});
app.use(eSession);
app.get('/test', (req, res) =>{
    res.send("Hello world");
});

app.use('/api', apiRouter);

io.use(sharedsession(eSession));

io.on("connection", (socket)=>{
    console.log('on connection');
    socket.on('connect', ()=>{
        console.log('SOCKET.IO: Connection establised with client id = '+ socket.id);
    });

    socket.on('authorize', (data)=>{
        //console.log('on auth. data = ' + JSON.stringify(data));
        let token = data.auth_token;
        let username = data.username;
        if(token == null || username == null)
        {
            socket.emit('resultAuthorize','Unauthorized');
            return;
        }
        console.log('SOCKET.IO: Have access with token = ' + token + ' , username = ' + username);

        authToken(token, (err, decoded)=>{
            if(err){
                console.log(err);
                socket.emit('resultAuthorize','Cannot authorized: Unexpeted error');
                return;
            }

            if(decoded.username !== username){
                socket.emit('resultAuthorize','Invalid token');
                return;
            }
            
            console.log('SOCKET.IO: Authorized socket id = ' + socket.id);
            console.log('decoded = ' , JSON.stringify(decoded));
            socket.handshake.session.auth = true;
            socket.handshake.session.userID = decoded.userID;
            socket.handshake.session.save();
            socket.join("all", ()=>{
                console.log("SOCKET.IO: Join client " + socket.id + " to room /all");
            });
            socket.emit('resultAuthorized', {code: 200});
        });
    });

    socket.on('disconnect', (reason)=>{
        console.log('SOCKET.IO: Disconnect client id = '+ socket.id + ' , with reason = ' + reason);
        socket.handshake.session = null;
    });

    setTimeout(function(){
        //sau 3s mà client vẫn chưa dc auth, lúc đấy chúng ta mới disconnect.
        if (!socket.handshake.session.auth) {
            console.log('Disconnect with reason timeout');
            socket.disconnect('unauthorized');
        }
    }, 3000);
});

// First check for db
initDB();
var getDB = async function () {
    console.log('check path');
    if(client == null || !client.isConnected()){
        await initDB();
    }
    return client;
};
app.set('db', getDB);
server.listen(port, ()=>
{
  console.log("Listening on port: " + port);
});

// Create a function to terminate your app gracefully:
function gracefulShutdown(){
    // First argument is [force], see mongoose doc.
    client.close(false, () => {
      console.log('MongoDb connection closed.');
    });
}

// Ask node to run your function before exit:

// This will handle process.exit():
process.on('exit', gracefulShutdown);

// This will handle kill commands, such as CTRL+C:
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGKILL', gracefulShutdown);

// This will prevent dirty exit on code-fault crashes:
// process.on('uncaughtException', gracefulShutdown);
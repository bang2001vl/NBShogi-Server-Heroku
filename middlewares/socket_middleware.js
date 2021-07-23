const {jwtOptions, jwt} = require('../Controller/authController');
const tokenSocketMDW = (socket, next)=>{
    var req = socket.require;
    var token = req.token;
    if(token != null)
    {
        console.log('Have access with token = ' + token);
        jwt.verify(token, process.env.SECRET, jwtOptions, (err, decoded)=>{
            if(!err){
                let userName = req.userName;
                if(decoded.userName === username)
                {
                    req.userID = decoded.id;
                    req.username = decoded.username;
                    next();
                    return;
                }
            }
            next(new Error('Cannot authorized: Unexpeted error'));
        });
    }
    else next(new Error('Unauthorized'));
};
const sessionSocketMDW = (socket, next) =>{
    console.log('on middleware');
    if(socket.handshake.session.authoried){
        next();
    }
    else {
        tokenSocketMDW(socket, next);
    }
};
module.exports = {
    tokenSocketMDW,
    sessionSocketMDW,
}
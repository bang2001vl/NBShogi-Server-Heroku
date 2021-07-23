import * as session from 'express-session';
import { Server } from "socket.io";
import * as jwt from 'jsonwebtoken';

import { jwtOptions } from '../Controller/authController.mjs';
import { Router } from 'express';

const io = new Server(router);

const sessionMiddleware = session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }});
Router.use(sessionMiddleware);

io.use((socket, next) => {
    let token = socket.require.session.token;
    jwt.verify(token,  "my-super-secret-key", jwtOptions);
});


export default {Router};
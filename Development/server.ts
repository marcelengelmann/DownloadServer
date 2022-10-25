import express from 'express';
import path from "path";
import mongoose from "mongoose";
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { ioConfig } from "./socket/config";


require('dotenv').config({ path: path.join(__dirname, `/../../${process.env.NODE_ENV || "development"}.env`) });

//routers
import router from "./routes/config";

const app = express();
app.disable("x-powered-by");

//passport config
require("./config/passport")(passport);

// allow public folder access
app.use(express.static(path.join(__dirname, '/../public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//mongoose
mongoose.connect(process.env.DATABASE_CONNECTION_URI || "")
    .then(() => console.log('connected to MongoDB'))
    .catch((err) => console.log(err));

//express session
const expressSession = session({
    secret: 'kdljse938o4wwWEE§"$7z6RGG%&$$rgdfASD@][{',
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_CONNECTION_URI })
})
app.use(expressSession);

//passport 
app.use(passport.initialize());
app.use(passport.session());

//routing
app.use(router);

//start server
const server: any = app.listen(process.env.SERVER_PORT, function () {
    var os = require('os');
    var networkInterfaces = os.networkInterfaces();
    var arr = networkInterfaces['Ethernet'];
    var ip = arr[1].address;
    for (let element of arr) {
        if (element.family === 'IPv4') {
            ip = element.address;
            break;
        }
    }
    console.log(`Listening at http://${ip}:${server.address().port}`);
});

ioConfig.setSocketConnection(server, [expressSession, passport.initialize(), passport.session()]);
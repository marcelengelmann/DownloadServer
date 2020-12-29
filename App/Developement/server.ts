import express from 'express';
const app = express();
app.disable("x-powered-by");
import path from "path";
import mongoose from "mongoose";
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import { cleanFilesFolder } from "./services/cleanUP";

//routers
import { router as indexRouter } from './routes/index';
import { router as publicFilesRouter } from './routes/publicFiles';
import { router as userFilesRouter } from './routes/privateFiles';
import { router as usersRouter } from './routes/users';
import { router as adminRouter } from './routes/admin';

//passport config
require("./config/passport")(passport);

// allow public folder access
app.use(express.static(path.join(__dirname, '/public')));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//mongoose
mongoose.connect('mongodb://localhost/DownloadServer',{useNewUrlParser: true, useUnifiedTopology : true})
    .then(() => console.log('connected to MongoDB'))
    .catch((err) => console.log(err));
    
//express session
app.use(session({
    secret: 'kdljse938o4wwWEE§"$7z6RGG%&$$rgdfASD@][{',
    resave : true,
    saveUninitialized : true
}));

//passport 
app.use(passport.initialize());
app.use(passport.session());

//routing
app.use("/users", usersRouter);
app.use("/files/public", publicFilesRouter);
app.use("/files/private", userFilesRouter);
app.use("/admin", adminRouter);
app.use("/", indexRouter);

//clean Files folder
cleanFilesFolder();

//start server
const server:any = app.listen(80, function () {
    var os = require('os');
    var networkInterfaces = os.networkInterfaces();
    var arr = networkInterfaces['Ethernet'];	
    var ip = arr[1].address;
	for (let i = 0; i < arr.length; i++){
		if(arr[i].family === 'IPv4'){
			ip = arr[i].address;
			break;
		}
	}
    console.log("Listening at http://%s:%s", ip, server.address().port);
});
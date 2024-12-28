import express from "express";
import session from "express-session";
import passport from "passport";
import path from "path";
import { socketIo } from "./socket/socketIoConfig";

require("dotenv").config({
	path: path.join(
		__dirname,
		`/../../${process.env.NODE_ENV || "development"}.env`
	),
});

//routers
import router from "./routes/config";
import { SqliteStore } from "./sessionStorage/sqliteSessionStorage";

const app = express();
app.disable("x-powered-by");

//passport config
require("./config/passport")(passport);

// allow public folder access
app.use(express.static(path.join(__dirname, "/../public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//express session
const expressSession = session({
	secret: 'kdljse938o4wwWEE§"$7z6RGG%&$$rgdfASD@][{',
	resave: false,
	saveUninitialized: true,
	store: SqliteStore,
	cookie: {
		maxAge: 365 * 24 * 60 * 60 * 1000,
	},
});
app.use(expressSession);

//passport
app.use(passport.initialize());
app.use(passport.session());

//routing
app.use(router);

//start server
const server: any = app.listen(process.env.SERVER_PORT, function () {
	var os = require("os");
	var networkInterfaces = os.networkInterfaces();
	var arr = networkInterfaces["Ethernet"];
	var ip = arr[1].address;
	for (let element of arr) {
		if (element.family === "IPv4") {
			ip = element.address;
			break;
		}
	}
	console.log(`Listening at http://${ip}:${server.address().port}`);
});

socketIo.setSocketConnection(server, [
	expressSession,
	passport.initialize(),
	passport.session(),
]);

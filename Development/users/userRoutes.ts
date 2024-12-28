import bcrypt from "bcrypt";
import express from "express";
import passport from "passport";
import { UserRole } from "./user";
import { UserService } from "./userService";
/*
https://www.google.com/search?q=nodejs+express+sqlite&hl=en&uact=5
https://developerhowto.com/2018/12/29/build-a-rest-api-with-node-js-and-express-js/
https://www.geeksforgeeks.org/how-to-create-table-in-sqlite3-database-using-node-js/
https://blog.appsignal.com/2024/06/19/how-to-perform-data-validation-in-nodejs.html
https://stackoverflow.com/questions/23481817/node-js-passport-autentification-with-sqlite
https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#preparestring---statement

*/

const router = express.Router();

router.get("/loginSuccess", (req, res) => {
	if (!req.isAuthenticated()) res.sendStatus(401);
	else {
		const user = req.user as any;
		res.send({
			username: user.username,
		});
	}
});

router.get("/loginError", (req, res) => {
	res.sendStatus(401);
});

//Register handle
router.post("/register", (req, res) => {
	const { username, password, passwordConfirm } = req.body;
	const errors: Array<string> = [];

	//vallidation
	if (
		!username ||
		!password ||
		!passwordConfirm ||
		username.length < 1 ||
		password.length < 1 ||
		passwordConfirm < 1
	)
		errors.push("Please fill in all fields!");

	if (!username.match(/^[0-9a-zA-Z]+$/))
		errors.push("The name must not have any special characters!");

	if (username.length > 20 || username.length < 3)
		errors.push("Your name must be between 3 and 20 characters!");

	if (password !== passwordConfirm) errors.push("The passwords do not match!");

	//check user exists
	const user = UserService.getUserByName(username);

	if (user) errors.push("User already exists!");

	if (errors.length > 0) {
		res.json(errors);
	} else {
		bcrypt.genSalt(10, (_, salt) =>
			bcrypt.hash(password, salt, (err, hashedPassword) => {
				if (err) throw err;
				const newUser = UserService.createUser({
					username: username,
					password: hashedPassword,
					role: UserRole.User,
				});
				if (!newUser) {
					res.sendStatus(500);
					return;
				}
				res.sendStatus(200);
				return;
			})
		);
	}
});
router.post("/login", (req, res, next) => {
	if (req.body.rememberMe) {
		req.session.cookie.originalMaxAge = 365 * 24 * 60 * 60 * 1000; // Cookie expires after 365 days
		req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000; // Cookie expires after 365 days
	} else {
		req.session.cookie.originalMaxAge = null;
		req.session.cookie.maxAge = undefined;
	}

	passport.authenticate("local", {
		successRedirect: "/users/loginSuccess",
		failureRedirect: "/users/loginError",
	})(req, res, next);
});

//logout
router.get("/logout", (req, res) => {
	req.logout(
		{
			keepSessionInfo: false,
		},
		() => {}
	);
	res.redirect("/");
});

export { router };

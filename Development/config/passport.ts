import bcrypt from "bcrypt";
import { UserService } from "../users/userService";

const LocalStrategy = require("passport-local").Strategy;

module.exports = function (passport: any) {
	passport.use(
		new LocalStrategy(function (
			username: string,
			password: string,
			done: Function
		) {
			const user = UserService.getUserByName(username);

			if (!user) {
				return done(null, false, {
					message: "The username or password is incorrect",
				});
			}
			bcrypt.compare(password, user.password, (err: any, isMatch: boolean) => {
				if (err) throw err;
				if (isMatch) return done(null, user);
				else
					return done(null, false, {
						message: "The username or password is incorrect",
					});
			});
		})
	);
	passport.serializeUser(function (user: any, done: Function) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id: number, done: Function) {
		const user = UserService.getUserById(id);
		if (!user) {
			return done(null, false);
		}
		return done(null, user);
	});
};

import { UserService } from "../users/userService";

const auth = {
	setCurrentUser: (req: any, res: any, next: any) => {
		if (req.isAuthenticated()) {
			next();
		} else {
			req.user = {};
			req.user.username = "Public";
			next();
		}
	},
	ensureAdmin: (req: any, res: any, next: any) => {
		if (req.isAuthenticated()) {
			const user = UserService.getUserByName(req.user.username);
			if (user?.role === "Admin") {
				next();
			} else res.redirect("/");
		} else res.redirect("/");
	},
};

export { auth };

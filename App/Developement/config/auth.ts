const User = require("../models/user.js")
const auth = {
    ensureAuthenticated: (req:any, res:any, next:any) => {
        if (req.isAuthenticated())
            return next();
        else
            res.redirect("/");
    },
    ensureAdmin: async (req: any, res: any, next: any) => {
        if (req.isAuthenticated()) {
            const user = await User.findOne({ name: req.user.name }).exec();
            if (user.role === "Admin") {
                next();
            }
            else
                res.redirect("/");
        }
        else
            res.redirect("/");
        }
}

export{auth}
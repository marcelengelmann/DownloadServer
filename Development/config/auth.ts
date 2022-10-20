import {UserModel} from "../models/userModel";
const auth = {
    setCurrentUser: async (req:any, res:any, next:any) => {
        if (req.isAuthenticated()) {
            next();
        }
        else{
            req.user = {};
            req.user.name = "Public";
            next();
        }
    },
    ensureAdmin: async (req: any, res: any, next: any) => {
        if (req.isAuthenticated()) {
            const user = await UserModel.findOne({ name: req.user.name });
            if (user?.role === "Admin") {
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
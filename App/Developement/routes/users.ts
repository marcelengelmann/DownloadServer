import express from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import fs from "fs";
import path from "path";
const router = express.Router();

const User = require("../models/user.js")

router.get('/loginSuccess', (req, res) => {
    if (!req.isAuthenticated())
        res.send("error");
    else {
        const user = req.user as any;
        res.send({
            name: user.name,
            role: user.role,
        });
    }
})

router.get('/loginError', (req, res) => {
    res.send("error");
})

//Register handle
router.post('/register', async (req, res) => {
    
    const { name, password, passwordConfirm } = req.body;
    const errors: Array<string> = [];
    
    //vallidation
    if (!name || !password || !passwordConfirm || name.length < 1 || password.length < 1 || passwordConfirm < 1)
        errors.push("Please fill in all fields!");
    
    if (!name.match(/^[0-9a-zA-Z]+$/))
        errors.push("The name must not have any special characters!");

    if (name.length > 20)
        errors.push("Your name can not be longer than 20 characters!");
    
    if (password !== passwordConfirm)
        errors.push("The passwords do not match!");
    
    //check user exists
    const user = await User.findOne({ name: name }).exec();
    
    if (user)
        errors.push("User already exists!");
    
    if (errors.length > 0) {
        
        res.json(errors);
    }
    else {
        bcrypt.genSalt(10, (_, salt) =>
            bcrypt.hash(password, salt, (err, hashedPassword) => {
                if (err) throw err;
                const newUser = new User({
                    name: name,
                    password: hashedPassword,
                });
                newUser.save()
                    .then((value: any) => {
                        console.log(value);
                        fs.mkdirSync(path.join(__dirname, "../Files/", value.name));
                        res.send("success")
                    })
                    .catch((value: any) => {
                        console.log(value);
                        res.send("error");
                    });
            }));
    }
})
router.post('/login', (req, res, next) => {
    if (req.body.rememberMe) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
        }
    passport.authenticate('local', {
        successRedirect: '/users/loginSuccess',
        failureRedirect: '/users/loginError',
    })(req, res, next);
});

//logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect("/");
})
 
export { router }
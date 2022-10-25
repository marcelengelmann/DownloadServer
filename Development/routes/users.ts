import express from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';

import { UserModel } from "../models/userModel";

const router = express.Router();


router.get('/loginSuccess', (req, res) => {
    if (!req.isAuthenticated())
        res.sendStatus(401);
    else {
        const user = req.user as any;
        res.send({
            name: user.name,
            role: user.role,
        });
    }
})

router.get('/loginError', (req, res) => {
    res.sendStatus(401);
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
    const user = await UserModel.findOne({ name: name });

    if (user)
        errors.push("User already exists!");

    if (errors.length > 0) {

        res.json(errors);
    }
    else {
        bcrypt.genSalt(10, (_, salt) =>
            bcrypt.hash(password, salt, (err, hashedPassword) => {
                if (err) throw err;
                const newUser = new UserModel({
                    name: name,
                    password: hashedPassword,
                });
                newUser.save()
                    .then((value: any) => {
                        res.sendStatus(200);
                    })
                    .catch((value: any) => {
                        res.sendStatus(500);
                    });
            }));
    }
})
router.post('/login', (req, res, next) => {
    if (req.body.rememberMe) {
        req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000; // Cookie expires after 365 days
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
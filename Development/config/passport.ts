const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
import { UserModel } from "../models/userModel";

module.exports = function (passport: any) {
    passport.use(
        new LocalStrategy(
            function (username: string, password: string, done: Function) {
                UserModel.findOne({ name: username })
                    .then((user) => {
                        if (!user)
                            return done(null, false, { message: 'The username or password is incorrect' });
                        bcrypt.compare(password, user.password, (err: Error, isMatch: boolean) => {

                            if (err) throw err;
                            if (isMatch)
                                return done(null, user);
                            else
                                return done(null, false, { message: 'The username or password is incorrect' });
                        });
                    })
                    .catch((err: Error) => console.log(err));
            }
        )
    );
    passport.serializeUser(function (user: any, done: Function) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id: string, done: Function) {
        UserModel.findById(id, function (err: Error, user: any) {
            done(err, user);
        });
    });
}
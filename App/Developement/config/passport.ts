const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require("../models/user");

module.exports = function (passport:any) {
    passport.use(
        new LocalStrategy(
            function (username: string, password: string, done: Function) {
                User.findOne({ name: username })
                    .then((user: typeof User) => {
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
    passport.serializeUser(function(user:typeof User, done:Function) {
        done(null, user.id);
    });
      
    passport.deserializeUser(function(id:string, done:Function) {
        User.findById(id, function(err:Error, user:typeof User) {
            done(err, user);
        });
    }); 
}
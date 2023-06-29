const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./database');
const { compareSync } = require('bcrypt');
require('express-session');

passport.use(new LocalStrategy(
    async function (username, password, cb) {
        try {
            const user = await User.findOne({ username: username }).exec()
            if (user){
                if (!compareSync(password, user.password)) { //When password is invalid 
                    return cb(null, false, { message: 'Incorrect password.' })
                }
                
                return cb(null, user); //When user is valid
                
            } else{
                return cb(null, false, { message: 'Incorrect username.' });
            };
        } catch(err) {
            return cb(err)
        }
        
            
    }
))


// Persists user data inside the session
passport.serializeUser(function(user, cb) {
    cb(null, user._id);
});
  
// fetches session details using session id 
passport.deserializeUser(async function(id, cb) {
  const user =await User.findById(id).exec();
  if (user) {
    cb(null, user);
  }
});
